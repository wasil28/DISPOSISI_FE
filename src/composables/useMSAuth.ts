import { BrowserCacheLocation, EventType, PublicClientApplication } from '@azure/msal-browser'

let tokenExpirationTimer: any

export const useMSAuth = () => {
  const config = useRuntimeConfig()

  const msalConfig = {
    auth: {
      clientId: '14a7d19a-ca92-472f-b95a-0becea012b5c',
      authority: 'https://login.microsoftonline.com/508916a0-7b89-43a1-af4e-72fe15aba5b9',
      redirectUri: 'https://kurikulum-dev.ut.ac.id/sso-auth',
      postLogoutRedirectUri: 'https://kurikulum-dev.ut.ac.id/logout',
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: true,
    },
    system: {
      tokenRenewalOffsetSeconds: 300,
    },
  }

  let msalInstance: PublicClientApplication | null = null

  const getMsalInstance = () => {
    if (!msalInstance) {
      msalInstance = new PublicClientApplication(msalConfig)
    }
    return msalInstance
  }

  async function initialize() {
    const instance = getMsalInstance()
    await instance.initialize()

    // Handle redirect promise after login or redirect
    await instance
      .handleRedirectPromise() // Handles the redirect promise and obtains the response
      .then(handleResponse)
      .catch((err) => {
        throw new Error(err)
      })

    // Add event callback for login success
    instance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS)
        setupTokenExpirationTimer()
    })
  }

  // Handle the response after login or redirect
  function handleResponse(resp: any) {
    if (resp?.account)
      setupTokenExpirationTimer()
    else
      console.log('LOGIN')
  }

  // Set up timer for refreshing access token upon expiration
  function setupTokenExpirationTimer() {
    const instance = getMsalInstance()
    const accounts = instance.getAllAccounts()
    if (accounts.length > 0) {
      const account = accounts[0]
      if (account.idTokenClaims && account.idTokenClaims.exp) {
        const tokenExpirationTime = account.idTokenClaims.exp * 1000
        const currentTime = Date.now()
        const timeUntilExpiration = tokenExpirationTime - currentTime

        clearTimeout(tokenExpirationTimer)

        tokenExpirationTimer = setTimeout(() => {
          refreshAccessToken(account)
        }, timeUntilExpiration)
      }
    }
  }

  // Refresh access token
  async function refreshAccessToken(account: any) {
    const instance = getMsalInstance()
    try {
      const response = await instance.acquireTokenSilent({
        account,
        scopes: ['User.Read'],
      })
      console.log('Refreshed Access Token:', response.accessToken)
      setupTokenExpirationTimer()
    }
    catch (err) {
      console.error('Token refresh error:', err)
      // signOut(account.homeAccountId);
    }
  }

  const loginRequest = {
    scopes: ['User.Read'],
  }

  // Sign in with redirect
  async function signIn() {
    const instance = getMsalInstance()
    try {
      await instance.loginRedirect(loginRequest)
    }
    catch (err) {
      console.log('Login error:', err)
    }
  }

  // Acquire access token silently
  async function acquireTokenSilent() {
    const instance = getMsalInstance()
    const accounts = instance.getAllAccounts()
    if (accounts.length > 0) {
      const account = accounts[0]
      instance.setActiveAccount(account)
      try {
        const response = await instance.acquireTokenSilent({
          account,
          scopes: ['User.Read'],
        })
        return response.accessToken
      }
      catch (err) {
        return null
      }
    }
    else {
      console.error('No accounts found')
      return null
    }
  }

  // Get all MSAL accounts
  function getAccounts() {
    const instance = getMsalInstance()
    return instance.getAllAccounts()
  }

  // Check if user is authenticated
  function isAuthenticated() {
    return getAccounts().length > 0
  }

  // Sign out user
  function signOut(accountId: string) {
    const instance = getMsalInstance()
    const account = accountId
      ? instance.getAccountByHomeId(accountId)
      : null
    if (account) {
      instance.logoutRedirect({
        account,
      })
      localStorage.clear()
    }
    else {
      console.error('Account not found')
    }
  }

  return {
    initialize,
    msalInstance: getMsalInstance(),
    signIn,
    getAccounts,
    acquireTokenSilent,
    isAuthenticated,
    signOut,
  }
}

