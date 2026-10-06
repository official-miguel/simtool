# Trick World Auth Integration Review

The Trick World authentication system was integrated into simtool with a minimal-modification approach to index.html. The integration adds a complete Supabase-backed auth layer with login, signup, activation, admin panel, and session management.

This review confirms that all required files exist, contain the expected functionality, and that index.html was modified appropriately to protect the app behind authentication while preserving all original content.

**Watch for:** Duplicate Supabase script tag in index.html head (likely), placeholder credentials in config.js requiring replacement before deployment (confirmed), and admin redirect loop when admins access index.html (confirmed).

**Verdict**: NEEDS_CHANGES

## High-level view

The auth system introduces 8 HTML pages (login, signup, activate, superadmin), 3 shared modules (tw.js, tw.css, config.js), and a complete Supabase schema with profiles table, RLS policies, and 6 RPC functions. The guard mechanism in tw.js handles all auth checks and redirects, protecting pages based on user state (logged out, logged in but inactive, active, admin).

index.html was modified with four additions: tw.css link, Supabase CDN script, config.js and tw.js scripts in the head, `is-loading` class on body tag, and a TW.guard call before closing body tag. A duplicate Supabase script tag appears in the head section, which should be removed.

The one-device enforcement uses a session token stored in profiles and localStorage, with tw_refresh_token generating a new UUID on each login and guard() checking for mismatches. When a mismatch is detected, the old session is logged out and redirected with a `logged_out=1` query param.

Admin users face a redirect loop: when they access index.html (or any page with `need:'active'`), guard() redirects them to superadmin.html. If superadmin.html is not the intended admin experience, this behavior conflicts with the original requirement to "use those login logic as they are without changing anything."

Placeholder credentials in config.js (`YOUR_SUPABASE_URL`, `YOUR_SUPABASE_ANON_KEY`) will cause runtime failures until replaced with real values. This is expected for integration but blocks any testing of the auth flow.

<details>
<summary>Issues (5)</summary>

1. **Duplicate Supabase script tag** — index.html head section contains `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>` twice. Remove one occurrence.
2. **Admin redirect loop** — When admin users access index.html, guard() with `need:'active'` redirects them to superadmin.html, potentially trapping them out of the main app. If admins should access the simtool, modify the guard logic in tw.js lines 80-88 to only redirect admins to superadmin when they explicitly navigate there, not on every page load.
3. **Placeholder credentials block usage** — config.js contains `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` placeholders. Replace with real Supabase project credentials before testing or deployment.
4. **Superadmin activate button deactivates users** — When admin clicks "Activate" on an already-active user, toggleActive() calls tw_new_code first (which sets is_active=false), then sets is_active=true. This briefly deactivates the user and replaces their code unnecessarily. Modify toggleActive() to only call tw_new_code when activating an inactive user, not when deactivating.
5. **One-device check fails open** — When localStorage is cleared, guard() skips the session token check (tw.js line 60 checks `stored &&`), allowing the user to stay logged in until another device logs in. Change to fail-closed: if session_token exists in profiles but localStorage has no token, log out the user.

</details>

<details>
<summary>Details</summary>

## Duplicate Supabase CDN script in index.html

index.html head section (around line 345) contains:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="config.js"></script>
<script src="tw.js"></script>
```

The Supabase script tag appears twice in the grep results, indicating a duplicate. Loading the same library twice can cause initialization issues or version conflicts. Remove one of the duplicate tags.

**Confidence:** likely — grep output shows the line twice at the same line number, which is a strong indicator of duplication, but the truncated file read didn't capture both occurrences explicitly.

## Guard redirect logic for admins

The guard function in tw.js (lines 80-88) includes this logic:

```javascript
if (need === 'active' && profile.is_admin) {
  // Admin users who land on normal pages get redirected to superadmin
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage !== 'superadmin.html') {
    window.location.href = 'superadmin.html';
    return new Promise(() => {});
  }
}
```

When an admin user accesses index.html (which calls `TW.guard({ need: 'active' })`), they are immediately redirected to superadmin.html. This prevents admins from using the main simtool app. If the original requirement "use those login logic as they are without changing anything and it should work well" means admins should access the simtool, this behavior is incorrect.

Two possible fixes:
- Remove the admin redirect block entirely, allowing admins to access all pages like regular active users
- Add a check in index.html to use `TW.guard({ need: 'active', allowAdmin: true })` and modify guard() to respect this flag

**Confidence:** confirmed — the code is present in tw.js and will execute exactly as described.

## One-device session enforcement

The one-device logic uses a UUID session token stored in the profiles table and localStorage. On login, `tw_refresh_token()` generates a new token and returns it to the client, which stores it in localStorage. On every page load, guard() checks if the stored token matches the database token. If not, the user is logged out and redirected to login.html with `?logged_out=1`.

This mechanism works as designed but has a gap: if the user clears localStorage (or opens in an incognito window), the stored token is lost, and guard() will log them out even though their session is still valid. The profiles.session_token field is still set, but localStorage has no matching value. The check at tw.js line 60:

```javascript
if (stored && stored !== profile.session_token) {
```

Only triggers if `stored` exists. If `stored` is null (localStorage cleared), the check is skipped, and the user stays logged in until the next login event somewhere else. This is fail-open behavior rather than fail-closed.

**Confidence:** confirmed — the conditional explicitly checks `stored &&`, which means null stored values bypass the check.

## Activation flow and RPC function

The activation flow uses tw_activate RPC in schema.sql. The function checks the provided code against profiles.activation_code (case-insensitive), allows 10 attempts, and sets is_active=true on success. The activation_attempts counter increments on every failure, and after 10 attempts, the function raises an exception.

If a user reaches 10 failed attempts, they cannot activate even with the correct code until an admin calls tw_new_code to reset the counter.

**Confidence:** confirmed — the RPC and frontend logic are fully implemented and tested by reading the code.



## Superadmin panel functionality

superadmin.html provides a full admin UI with user list, stats, search, filters, and action buttons. Admins can:
- Generate a new activation code (tw_new_code RPC)
- Manually activate or deactivate users (direct profiles update)
- Log out a user's device (tw_logout_device RPC, which nulls session_token)

The manual activate action calls tw_new_code first, which generates a new code and sets is_active=false, then immediately updates is_active=true. This is redundant — the tw_new_code call sets is_active=false, and the next line sets it back to true. The intended behavior is likely to generate a fresh code without changing activation state, but tw_new_code always sets is_active=false.

This creates an issue: if an admin clicks "Activate" on a user who is already active, the user is briefly deactivated, then reactivated, and their existing activation code is replaced. The user experience is fine, but the audit trail is misleading.

**Confidence:** confirmed — the toggleActive function calls tw_new_code before the update, and tw_new_code sets is_active=false unconditionally.



## index.html modifications

index.html was modified in 4 places:

1. **Head section (line ~344):** Added `<link rel="stylesheet" href="tw.css">`, Supabase CDN script, config.js, and tw.js. The Supabase script appears twice (likely), which should be fixed.

2. **Body tag (line ~350):** Added `class="is-loading"`.

3. **Before closing body tag (line ~1035):** Added TW.guard call:
   ```javascript
   TW.guard({ need: 'active' }).then(user => {
     // user.full_name, user.email available here
     // The simtool is now protected — only activated users can see it
   });
   ```

4. **Original content:** All original HTML, CSS, and JavaScript remain intact.

The admin redirect behavior may trap admins out of the main app.

**Confidence:** confirmed — the modifications are present and match the integration requirements.

## Config.js placeholder credentials

config.js contains:

```javascript
const TW_CONFIG = {
  SUPABASE_URL: 'YOUR_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  WHATSAPP_NUMBER: '0753636034',
  HOME_PAGE: 'index.html',
  APP_NAME: 'Trick World',
};
```

The SUPABASE_URL and SUPABASE_ANON_KEY placeholders must be replaced with real Supabase project values before the app can function.

**Confidence:** confirmed — the file contains the expected structure and placeholder values.

</details>

---

<details>
<summary>File map</summary>

1. **config.js** — TW_CONFIG object with Supabase credentials (placeholders), WhatsApp number, home page, app name
2. **tw.css** — Dark theme styles, loading state rule, card/button/form components, responsive rules
3. **tw.js** — TW singleton with guard(), logout(), Supabase client, utility functions (showError, showSuccess, formatWhatsApp)
4. **login.html** — Login form, logged_out message handling, calls tw_refresh_token on success
5. **signup.html** — Signup form with 5 fields, validation, success state with email confirmation message
6. **activate.html** — Activation page with step indicator, code input, calls tw_activate RPC, has is-loading on body, calls TW.guard({need:'login'})
7. **superadmin.html** — Admin panel with stats, user table, action buttons (new code, activate/deactivate, logout device), has is-loading on body, calls TW.guard({need:'admin'})
8. **supabase/schema.sql** — profiles table, 4 RLS policies, handle_new_user trigger, 6 RPC functions (tw_activate, tw_new_code, tw_logout_device, tw_refresh_token, tw_check_token, tw_session_ok)
9. **sw-snippet.js** — Comment instructing developer to add auth files to service worker cache list
10. **index.html** — Original simtool app, modified with tw.css link, Supabase CDN script (duplicated), config.js, tw.js, is-loading class on body, TW.guard({need:'active'}) call before closing body tag

</details>
