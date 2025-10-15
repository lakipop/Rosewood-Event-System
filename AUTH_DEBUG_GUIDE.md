# 🔧 Auth Persistence Debug Guide

## Changes Made

### 1. Created Auth Plugin
**File:** `plugins/auth.client.ts`

This plugin runs **BEFORE** any page loads and restores auth state from sessionStorage.

```typescript
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  authStore.initAuth()  // Runs before middleware!
})
```

### 2. Updated Auth Store with Debug Logs
**File:** `stores/auth.ts`

Added console.log statements to track:
- When initAuth() is called
- If token exists in sessionStorage
- If user data exists and can be parsed
- If auth restoration was successful

### 3. Updated Middleware with Debug Logs
**File:** `middleware/auth.ts`

Added console.log statements to track:
- Which page is being accessed
- Current authentication status
- User email if authenticated
- Whether redirect happens

### 4. Updated app.vue
**File:** `app.vue`

Changed from `onMounted()` to immediate execution in setup.

---

## 🧪 Testing Steps

### Step 1: Clear Everything
1. Open browser DevTools (F12)
2. Go to **Application** tab → **Storage** → **Clear site data**
3. Close DevTools
4. Hard refresh (Ctrl+Shift+R)

### Step 2: Login
1. Go to login page
2. Open Console (F12 → Console tab)
3. Login with credentials
4. Watch for these logs:
   ```
   🔌 [Auth Plugin] Running auth plugin...
   🔍 [Auth] Initializing auth from sessionStorage...
   ✅ [Auth] Auth restored successfully: your@email.com
   ```

### Step 3: Test Page Reload
1. Stay logged in
2. Press F5 or Ctrl+R
3. **Watch the Console logs carefully:**

**Expected Log Sequence:**
```
🔌 [Auth Plugin] Running auth plugin...
🔍 [Auth] Initializing auth from sessionStorage...
🔍 [Auth] Token exists: true
🔍 [Auth] User exists: true
✅ [Auth] Auth restored successfully: your@email.com
🔌 [Auth Plugin] Auth initialized, isAuthenticated: true
🛡️ [Auth Middleware] Checking auth for: /
🛡️ [Auth Middleware] isAuthenticated: true
🛡️ [Auth Middleware] User: your@email.com
✅ [Auth Middleware] Authenticated, allowing access
```

**If You See This (BAD):**
```
🔌 [Auth Plugin] Running auth plugin...
🔍 [Auth] Initializing auth from sessionStorage...
🔍 [Auth] Token exists: false
🔍 [Auth] User exists: false
⚠️ [Auth] No stored auth data found
🛡️ [Auth Middleware] isAuthenticated: false
❌ [Auth Middleware] Not authenticated, redirecting to login
```

---

## 🔍 Debugging Common Issues

### Issue 1: Plugin Not Running
**Symptoms:** No "🔌 [Auth Plugin]" logs

**Solution:**
- Check if `plugins/auth.client.ts` exists
- Restart dev server (`npm run dev`)
- Clear `.nuxt` folder and restart

### Issue 2: SessionStorage Empty After Reload
**Symptoms:** "Token exists: false" after reload

**Possible Causes:**
1. **Browser in Incognito Mode** - sessionStorage cleared on tab close
2. **Browser Settings** - Blocking cookies/storage
3. **Multiple Tabs** - Each tab has separate sessionStorage

**Test:**
```javascript
// Open console and check manually:
sessionStorage.getItem('auth_token')
sessionStorage.getItem('user')
```

### Issue 3: Plugin Runs But Middleware Still Fails
**Symptoms:** Plugin logs show success, but middleware shows not authenticated

**Check:**
```javascript
// In console after page load:
window.$nuxt.$auth  // or
useAuthStore().$state
```

### Issue 4: Middleware Runs Before Plugin
**Symptoms:** Middleware logs appear before plugin logs

**Solution:**
- Plugins should run first by default in Nuxt 3
- If not, rename plugin to `01.auth.client.ts` to force order

---

## 📊 SessionStorage Inspector

### Check Current Auth State
Open Console and run:
```javascript
console.log('Token:', sessionStorage.getItem('auth_token'))
console.log('User:', JSON.parse(sessionStorage.getItem('user')))
```

### Manually Set Auth (for testing)
```javascript
sessionStorage.setItem('auth_token', 'your-token-here')
sessionStorage.setItem('user', JSON.stringify({
  userId: 1,
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'admin',
  status: 'active'
}))
```

### Clear Auth
```javascript
sessionStorage.removeItem('auth_token')
sessionStorage.removeItem('user')
```

---

## 🎯 Expected Behavior After Fix

✅ **Login** → Token saved to sessionStorage → Redirect to dashboard
✅ **Page Reload** → Plugin restores auth → Middleware allows access → Stay on same page
✅ **Navigate** → Auth state persists → No login required
✅ **Close Tab** → sessionStorage cleared (expected behavior)
✅ **New Tab** → No auth → Login required (expected for sessionStorage)

---

## 🚨 If Still Not Working

### Last Resort: Switch to localStorage
If sessionStorage behavior is problematic, you can temporarily switch back to localStorage:

In `stores/auth.ts`, change all:
- `sessionStorage` → `localStorage`

**Note:** localStorage persists even after closing the browser.

---

## 📞 Next Steps

1. Run `npm run dev`
2. Open browser Console (F12)
3. Login
4. Watch the logs
5. Reload page (F5)
6. Send me the console logs if it still doesn't work!

The debug logs will tell us exactly where the flow is breaking.
