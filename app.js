import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {
  apiKey:
    "AIzaSyDh9vQKIIKNWTl8GfjLgNzksEWBUIY6mYs",

  authDomain:
    "lega-10e72.firebaseapp.com",

  projectId:
    "lega-10e72",

  storageBucket:
    "lega-10e72.firebasestorage.app",

  messagingSenderId:
    "64220913818",

  appId:
    "1:64220913818:web:c0362b644a52e70ad8ff23",

  measurementId:
    "G-YHZYTJKGF5"
};


const app =
  initializeApp(firebaseConfig);

const auth =
  getAuth(app);

const db =
  getFirestore(app);

const provider =
  new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account"
});


/* =========================================================
   DOM
========================================================= */

const el = id =>
  document.getElementById(id);


/* PUBLIC */

const landingPage =
  el("page-landing");

const authPage =
  el("page-auth");

const appPage =
  el("page-app");

const navActions =
  el("nav-actions");

const navLoginButton =
  el("nav-login-button");

const heroStoriesButton =
  el("hero-stories-button");

const heroJoinButton =
  el("hero-join-button");

const builderEnterButton =
  el("builder-enter-button");

const collectorEnterButton =
  el("collector-enter-button");

const collectorStartButton =
  el("collector-start-button");

const brandHome =
  el("brand-home");

const publicSiteButton =
  el("public-site-button");


/* AUTH */

const authName =
  el("auth-name");

const authEmail =
  el("auth-email");

const authPass =
  el("auth-pass");

const btnLogin =
  el("btn-login");

const btnSignup =
  el("btn-signup");

const btnGoogle =
  el("btn-google");


/* STORIES */

const landingStoriesGrid =
  el("landing-stories-grid");

const authenticatedStoriesGrid =
  el("authenticated-stories-grid");


/* APP */

const appLayout =
  el("app-layout");

const sidebarToggle =
  el("sidebar-toggle");

const profileTrigger =
  el("profile-trigger");

const sidebarAvatar =
  el("sidebar-avatar");

const sidebarName =
  el("sidebar-name");

const drawerAvatar =
  el("drawer-avatar");

const profileDrawer =
  el("profile-drawer");

const drawerBackdrop =
  el("drawer-backdrop");

const drawerClose =
  el("drawer-close");

const profileNameInput =
  el("profile-name-input");

const saveProfileName =
  el("save-profile-name");

const profileEmail =
  el("profile-email");

const profileRole =
  el("profile-role");

const drawerCollectorStatus =
  el("drawer-collector-status");

const drawerLogout =
  el("drawer-logout");

const navStories =
  el("nav-stories");

const panelStories =
  el("panel-stories");

const panelWorkstation =
  el("panel-workstation");

const becomeCollectorBtn =
  el("become-collector-btn");

const openWorkstationBtn =
  el("open-workstation-btn");

const backToStoriesBtn =
  el("back-to-stories-btn");


/* EDITOR */

const storyTitle =
  el("story-title");

const editorDocument =
  el("editor-document");

const saveDraftBtn =
  el("save-draft-btn");

const fullscreenEditorBtn =
  el("fullscreen-editor-btn");

const purifyPublishBtn =
  el("purify-publish-btn");

const storyCategory =
  el("story-category");

const storyLocation =
  el("story-location");

const storyTopic =
  el("story-topic");

const storyDate =
  el("story-date");


/* PURIFICATION */

const purificationStatus =
  el("purification-status");

const purificationResult =
  el("purification-result");

const purificationScore =
  el("purification-score");


/* =========================================================
   VIEW CONTROLLER
========================================================= */

function showView(
  view
) {

  [
    landingPage,
    authPage,
    appPage
  ].forEach(
    page => {

      if (!page)
        return;

      page.classList.remove(
        "active"
      );

    }
  );


  if (view) {

    view.classList.add(
      "active"
    );

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function showLanding() {
  showView(
    landingPage
  );
}


function showAuth() {
  showView(
    authPage
  );
}


function showApp() {
  showView(
    appPage
  );
}


/* =========================================================
   NAVIGATION BUTTONS
========================================================= */

navLoginButton?.addEventListener(
  "click",
  () => {

    if (auth.currentUser) {

      showApp();

    }
    else {

      showAuth();

    }

  }
);


heroJoinButton?.addEventListener(
  "click",
  () => {

    if (auth.currentUser) {

      showApp();

    }
    else {

      showAuth();

    }

  }
);


heroStoriesButton?.addEventListener(
  "click",
  () => {

    document
      .getElementById(
        "stories"
      )
      ?.scrollIntoView({
        behavior: "smooth"
      });

  }
);


builderEnterButton?.addEventListener(
  "click",
  () => {

    if (auth.currentUser) {

      showApp();

    }
    else {

      showAuth();

    }

  }
);


collectorEnterButton?.addEventListener(
  "click",
  () => {

    if (auth.currentUser) {

      showApp();

    }
    else {

      showAuth();

    }

  }
);


collectorStartButton?.addEventListener(
  "click",
  () => {

    if (auth.currentUser) {

      openWorkstation();

    }
    else {

      showAuth();

    }

  }
);


brandHome?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    showLanding();

  }
);


publicSiteButton?.addEventListener(
  "click",
  showLanding
);


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
  auth,
  async user => {

    /*
      THIS IS NOW THE ONLY PLACE THAT DECIDES
      WHETHER THE USER IS INSIDE THE APP.
    */

    if (user) {

      console.log(
        "[Legacy] Authenticated:",
        user.email
      );


      /*
        Directly activate the application.
        No dependency on inline switchPage.
      */

      showApp();


      updateUserIdentity(
        user
      );


      renderLoggedInNav();


      updateCollectorUI();


      await loadStories();

    }

    else {

      console.log(
        "[Legacy] Logged out"
      );


      showLanding();


      renderLoggedOutNav();


      await loadStories();

    }

  }
);


/* =========================================================
   GOOGLE REDIRECT RESULT
========================================================= */

getRedirectResult(
  auth
)
.then(
  result => {

    if (result?.user) {

      showToast(
        "Google sign-in successful."
      );

    }

  }
)
.catch(
  error => {

    console.error(
      "[Legacy] Google redirect:",
      error
    );

    showToast(
      friendlyAuthError(
        error
      )
    );

  }
);


/* =========================================================
   LOGGED-IN NAV
========================================================= */

function renderLoggedInNav() {

  if (!navActions)
    return;


  navActions.innerHTML = `

    <button
      id="logout-button"
      class="nav-btn"
      type="button"
    >
      Log Out
    </button>

  `;


  el(
    "logout-button"
  )?.addEventListener(
    "click",
    async () => {

      try {

        await signOut(
          auth
        );

        showLanding();

      }
      catch (
        error
      ) {

        console.error(
          error
        );

      }

    }
  );

}


function renderLoggedOutNav() {

  if (!navActions)
    return;


  navActions.innerHTML = `

    <button
      id="nav-login-button-new"
      class="nav-btn"
      type="button"
    >
      Sign In / Register
    </button>

  `;


  el(
    "nav-login-button-new"
  )?.addEventListener(
    "click",
    () => showAuth()
  );

}


/* =========================================================
   EMAIL LOGIN
========================================================= */

btnLogin?.addEventListener(
  "click",
  async () => {

    const email =
      authEmail?.value.trim();

    const password =
      authPass?.value;


    if (!email || !password) {

      showToast(
        "Enter your email and password."
      );

      return;

    }


    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      /*
        onAuthStateChanged()
        moves the user to page-app.
      */

    }
    catch (
      error
    ) {

      console.error(
        "[Legacy] Login:",
        error
      );

      showToast(
        friendlyAuthError(
          error
        )
      );

    }

  }
);


/* =========================================================
   EMAIL SIGNUP
========================================================= */

btnSignup?.addEventListener(
  "click",
  async () => {

    const name =
      authName?.value.trim();

    const email =
      authEmail?.value.trim();

    const password =
      authPass?.value;


    if (!name) {

      showToast(
        "Enter your name."
      );

      return;

    }


    if (!email || !password) {

      showToast(
        "Enter your email and password."
      );

      return;

    }


    if (password.length < 6) {

      showToast(
        "Password needs at least 6 characters."
      );

      return;

    }


    try {

      const credentials =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


      await updateProfile(
        credentials.user,
        {
          displayName:
            name
        }
      );


      updateUserIdentity(
        credentials.user
      );


      /*
        Auth state listener opens app.
      */

    }
    catch (
      error
    ) {

      console.error(
        "[Legacy] Signup:",
        error
      );

      showToast(
        friendlyAuthError(
          error
        )
      );

    }

  }
);


/* =========================================================
   GOOGLE
========================================================= */

btnGoogle?.addEventListener(
  "click",
  async () => {

    try {

      await signInWithPopup(
        auth,
        provider
      );

    }
    catch (
      error
    ) {

      console.error(
        "[Legacy] Google:",
        error
      );


      const code =
        error?.code ||
        "";


      if (
        code.includes(
          "popup-blocked"
        ) ||
        code.includes(
          "popup-closed-by-user"
        ) ||
        code.includes(
          "cancelled-popup-request"
        )
      ) {

        try {

          await signInWithRedirect(
            auth,
            provider
          );

        }
        catch (
          redirectError
        ) {

          console.error(
            redirectError
          );

          showToast(
            friendlyAuthError(
              redirectError
            )
          );

        }

        return;

      }


      showToast(
        friendlyAuthError(
          error
        )
      );

    }

  }
);


/* =========================================================
   USER IDENTITY
========================================================= */

function getUserName(
  user
) {

  if (
    user?.displayName &&
    user.displayName.trim()
  ) {

    return user.displayName.trim();

  }


  if (user?.email) {

    return user
      .email
      .split("@")[0]
      .replace(
        /[._-]+/g,
        " "
      )
      .replace(
        /\b\w/g,
        char =>
          char.toUpperCase()
      );

  }


  return "User";

}


function updateUserIdentity(
  user
) {

  const name =
    getUserName(
      user
    );


  const initial =
    name.charAt(0)
      .toUpperCase();


  if (sidebarAvatar)
    sidebarAvatar.textContent =
      initial;


  if (drawerAvatar)
    drawerAvatar.textContent =
      initial;


  if (sidebarName)
    sidebarName.textContent =
      name;


  if (profileNameInput)
    profileNameInput.value =
      name;


  if (profileEmail)
    profileEmail.textContent =
      user.email ||
      "Authenticated user";


  if (profileRole)
    profileRole.textContent =
      isCollector()
        ? "Legacy Data Collector"
        : "Legacy Reader";


  updateDrawerCollectorState();

}


/* =========================================================
   PROFILE DRAWER
========================================================= */

profileTrigger?.addEventListener(
  "click",
  () => {

    profileDrawer?.classList.add(
      "active"
    );

    drawerBackdrop?.classList.add(
      "active"
    );

  }
);


function closeProfile() {

  profileDrawer?.classList.remove(
    "active"
  );

  drawerBackdrop?.classList.remove(
    "active"
  );

}


drawerClose?.addEventListener(
  "click",
  closeProfile
);


drawerBackdrop?.addEventListener(
  "click",
  closeProfile
);


drawerLogout?.addEventListener(
  "click",
  async () => {

    await signOut(
      auth
    );

    closeProfile();

  }
);


/* =========================================================
   PROFILE NAME
========================================================= */

saveProfileName?.addEventListener(
  "click",
  async () => {

    const user =
      auth.currentUser;


    if (!user)
      return;


    const name =
      profileNameInput?.value.trim();


    if (!name) {

      showToast(
        "Enter your name."
      );

      return;

    }


    try {

      await updateProfile(
        user,
        {
          displayName:
            name
        }
      );


      updateUserIdentity(
        user
      );


      showToast(
        "Name updated."
      );

    }
    catch (
      error
    ) {

      console.error(
        error
      );

      showToast(
        "Could not update your name."
      );

    }

  }
);


/* =========================================================
   SIDEBAR COLLAPSE
========================================================= */

sidebarToggle?.addEventListener(
  "click",
  event => {

    event.preventDefault();
    event.stopPropagation();


    const isClosed =
      appLayout?.classList.toggle(
        "sidebar-closed"
      );


    sidebarToggle.textContent =
      isClosed
        ? "›"
        : "‹";


    sidebarToggle.title =
      isClosed
        ? "Open sidebar"
        : "Collapse sidebar";

  }
);


/* =========================================================
   COLLECTOR
========================================================= */

function collectorKey() {

  const uid =
    auth.currentUser?.uid;


  if (!uid)
    return null;


  return (
    "legacy_collector_" +
    uid
  );

}


function isCollector() {

  const key =
    collectorKey();


  if (!key)
    return false;


  return (
    localStorage.getItem(
      key
    ) === "true"
  );

}


function updateCollectorUI() {

  const active =
    isCollector();


  if (becomeCollectorBtn) {

    becomeCollectorBtn.style.display =
      active
        ? "none"
        : "block";

  }


  if (openWorkstationBtn) {

    openWorkstationBtn.style.display =
      active
        ? "block"
        : "none";

  }


  if (profileRole) {

    profileRole.textContent =
      active
        ? "Legacy Data Collector"
        : "Legacy Reader";

  }


  updateDrawerCollectorState();

}


function updateDrawerCollectorState() {

  if (!drawerCollectorStatus)
    return;


  drawerCollectorStatus.textContent =
    isCollector()
      ? "Data Collector"
      : "Reader";

}


becomeCollectorBtn?.addEventListener(
  "click",
  () => {

    const user =
      auth.currentUser;


    if (!user) {

      showAuth();

      return;

    }


    const key =
      collectorKey();


    if (!key)
      return;


    localStorage.setItem(
      key,
      "true"
    );


    updateCollectorUI();


    showToast(
      "Data Collector activated."
    );


    openWorkstation();

  }
);


openWorkstationBtn?.addEventListener(
  "click",
  openWorkstation
);


/* =========================================================
   WORKSPACE
========================================================= */

function showStories() {

  if (!panelStories ||
      !panelWorkstation) {

    return;

  }


  panelStories.classList.add(
    "active"
  );

  panelWorkstation.classList.remove(
    "active"
  );


  navStories?.classList.add(
    "active"
  );

}


function openWorkstation() {

  if (!auth.currentUser) {

    showAuth();

    return;

  }


  if (!isCollector()) {

    showToast(
      "Activate Data Collector first."
    );

    return;

  }


  panelStories?.classList.remove(
    "active"
  );


  panelWorkstation?.classList.add(
    "active"
  );


  navStories?.classList.remove(
    "active"
  );


  loadDraft();

}


navStories?.addEventListener(
  "click",
  showStories
);


backToStoriesBtn?.addEventListener(
  "click",
  showStories
);


/* =========================================================
   DISABLED SECTIONS
========================================================= */

el(
  "saved-stories-button"
)?.addEventListener(
  "click",
  () => showToast(
    "Saved Stories is coming next."
  )
);


el(
  "datasets-button"
)?.addEventListener(
  "click",
  () => showToast(
    "Datasets are coming next."
  )
);


el(
  "builder-button"
)?.addEventListener(
  "click",
  () => showToast(
    "Builder tools are coming next."
  )
);


/* =========================================================
   EDITOR SELECTION
========================================================= */

let savedRange =
  null;


function saveSelection() {

  const selection =
    window.getSelection();


  if (
    !selection ||
    !selection.rangeCount ||
    !editorDocument
  ) {

    return;

  }


  const range =
    selection.getRangeAt(
      0
    );


  if (
    editorDocument.contains(
      range.commonAncestorContainer
    )
  ) {

    savedRange =
      range.cloneRange();

  }

}


function restoreSelection() {

  if (!savedRange) {

    editorDocument?.focus();

    return;

  }


  const selection =
    window.getSelection();


  selection.removeAllRanges();


  selection.addRange(
    savedRange
  );


  editorDocument.focus();

}


document.addEventListener(
  "selectionchange",
  saveSelection
);


editorDocument?.addEventListener(
  "keyup",
  saveSelection
);


editorDocument?.addEventListener(
  "mouseup",
  saveSelection
);


/* =========================================================
   WORD TOOLBAR
========================================================= */

document
  .querySelectorAll(
    ".toolbar-btn[data-command]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "mousedown",
        event => {

          event.preventDefault();

          restoreSelection();


          document.execCommand(
            button.dataset.command,
            false,
            null
          );


          saveSelection();

        }
      );

    }
  );


el(
  "font-family"
)?.addEventListener(
  "change",
  event => {

    restoreSelection();


    document.execCommand(
      "fontName",
      false,
      event.target.value
    );


    saveSelection();

  }
);


el(
  "font-size"
)?.addEventListener(
  "change",
  event => {

    restoreSelection();


    document.execCommand(
      "fontSize",
      false,
      event.target.value
    );


    saveSelection();

  }
);


el(
  "text-color"
)?.addEventListener(
  "input",
  event => {

    restoreSelection();


    document.execCommand(
      "foreColor",
      false,
      event.target.value
    );


    saveSelection();

  }
);


el(
  "highlight-color"
)?.addEventListener(
  "input",
  event => {

    restoreSelection();


    document.execCommand(
      "hiliteColor",
      false,
      event.target.value
    );


    saveSelection();

  }
);


/* =========================================================
   HEADINGS
========================================================= */

function formatBlock(
  tag
) {

  restoreSelection();


  document.execCommand(
    "formatBlock",
    false,
    tag
  );


  saveSelection();

}


el(
  "heading-one"
)?.addEventListener(
  "mousedown",
  event => {

    event.preventDefault();

    formatBlock(
      "h1"
    );

  }
);


el(
  "heading-two"
)?.addEventListener(
  "mousedown",
  event => {

    event.preventDefault();

    formatBlock(
      "h2"
    );

  }
);


el(
  "blockquote-tool"
)?.addEventListener(
  "mousedown",
  event => {

    event.preventDefault();

    formatBlock(
      "blockquote"
    );

  }
);


/* =========================================================
   LINK
========================================================= */

el(
  "insert-link"
)?.addEventListener(
  "mousedown",
  event => {

    event.preventDefault();


    restoreSelection();


    const url =
      window.prompt(
        "Enter URL:"
      );


    if (!url)
      return;


    document.execCommand(
      "createLink",
      false,
      url
    );


    saveSelection();

  }
);


/* =========================================================
   TABLE
========================================================= */

el(
  "insert-table"
)?.addEventListener(
  "click",
  () => {

    const rows =
      Number(
        window.prompt(
          "Rows:",
          "3"
        )
      );


    const columns =
      Number(
        window.prompt(
          "Columns:",
          "3"
        )
      );


    if (
      !rows ||
      !columns ||
      rows < 1 ||
      columns < 1
    ) {

      return;

    }


    const table =
      document.createElement(
        "table"
      );


    const body =
      document.createElement(
        "tbody"
      );


    for (
      let row = 0;
      row < rows;
      row++
    ) {

      const tr =
        document.createElement(
          "tr"
        );


      for (
        let col = 0;
        col < columns;
        col++
      ) {

        const cell =
          document.createElement(
            row === 0
              ? "th"
              : "td"
          );


        cell.textContent =
          row === 0
            ? `Column ${col + 1}`
            : "Enter data";


        cell.contentEditable =
          "true";


        tr.appendChild(
          cell
        );

      }


      body.appendChild(
        tr
      );

    }


    table.appendChild(
      body
    );


    editorDocument?.appendChild(
      table
    );


    editorDocument?.appendChild(
      document.createElement(
        "p"
      )
    );

  }
);


/* =========================================================
   FULLSCREEN
========================================================= */

fullscreenEditorBtn?.addEventListener(
  "click",
  () => {

    const active =
      document.body.classList.toggle(
        "editor-fullscreen"
      );


    fullscreenEditorBtn.textContent =
      active
        ? "Exit Fullscreen"
        : "Fullscreen";

  }
);


/* =========================================================
   DRAFT
========================================================= */

function draftKey() {

  return (
    "legacy_draft_" +
    (
      auth.currentUser?.uid ||
      "guest"
    )
  );

}


function loadDraft() {

  const raw =
    localStorage.getItem(
      draftKey()
    );


  if (!raw) {

    if (storyDate) {

      storyDate.value =
        today();

    }

    return;

  }


  try {

    const draft =
      JSON.parse(
        raw
      );


    if (storyTitle)
      storyTitle.value =
        draft.title ||
        "";


    if (editorDocument)
      editorDocument.innerHTML =
        draft.content ||
        "";


  }
  catch (error) {

    console.warn(
      "Draft error:",
      error
    );

  }

}


saveDraftBtn?.addEventListener(
  "click",
  () => {

    const draft = {

      title:
        storyTitle?.value ||
        "",

      content:
        editorDocument?.innerHTML ||
        "",

      savedAt:
        new Date().toISOString()

    };


    localStorage.setItem(
      draftKey(),
      JSON.stringify(
        draft
      )
    );


    showToast(
      "Draft saved on this device."
    );

  }
);


/* =========================================================
   PURIFY + PUBLISH
========================================================= */

purifyPublishBtn?.addEventListener(
  "click",
  async () => {

    if (!auth.currentUser) {

      showToast(
        "You are not logged in."
      );

      showAuth();

      return;

    }


    if (!isCollector()) {

      showToast(
        "Activate Data Collector first."
      );

      return;

    }


    const title =
      storyTitle?.value.trim();


    const bodyText =
      editorDocument?.innerText.trim();


    const bodyHtml =
      editorDocument?.innerHTML.trim();


    if (!title) {

      showToast(
        "Give your Story a title."
      );

      return;

    }


    if (!bodyText) {

      showToast(
        "Write your Story first."
      );

      return;

    }


    await purifyAndPublish({
      title,
      bodyText,
      bodyHtml
    });

  }
);


/* =========================================================
   PURIFICATION
========================================================= */

async function purifyAndPublish(
  payload
) {

  purificationStatus?.classList.add(
    "active"
  );


  purificationResult?.classList.remove(
    "active"
  );


  resetProcessing();


  await processingStep(
    1,
    "✓ Capturing raw record",
    350
  );


  await processingStep(
    2,
    "✓ Checking metadata",
    350
  );


  const parameters =
    internalParameters(
      payload
    );


  await processingStep(
    3,
    "✓ Running Legacy reasoning",
    500
  );


  const result =
    calculateLegacyFormula(
      parameters
    );


  await processingStep(
    4,
    "✓ Validating",
    450
  );


  await processingStep(
    5,
    "✓ Building Story",
    450
  );


  if (purificationScore) {

    purificationScore.textContent =
      result.F.toFixed(
        3
      );

  }


  purificationResult?.classList.add(
    "active"
  );


  await publishStory(
    payload,
    result
  );

}


async function processingStep(
  number,
  text,
  wait
) {

  const item =
    el(
      `processing-${number}`
    );


  if (item) {

    item.textContent =
      text;

    item.classList.add(
      "done"
    );

  }


  await sleep(
    wait
  );

}


/* =========================================================
   INTERNAL PARAMETERS
========================================================= */

function internalParameters(
  payload
) {

  const words =
    payload.bodyText
      .split(/\s+/)
      .filter(Boolean)
      .length;


  return {

    C:
      words >= 120
        ? .85
        : .70,

    B:
      .80,

    R:
      .50,

    G:
      16,

    I:
      0,

    confirmations:
      1,

    contradictions:
      0,

    lenses:
      4

  };

}


/* =========================================================
   FORMULA
========================================================= */

function calculateLegacyFormula(
  p
) {

  const Gnorm =
    (
      p.G - 11
    ) / 11;


  const W =
    (
      (
        p.C *
        p.B
      ) +
      p.R
    ) *
    (
      1 +
      Math.pow(
        Gnorm,
        2
      )
    ) *
    (
      1 +
      Math.abs(
        p.I
      ) / 4
    );


  const M =
    W *
    (
      p.confirmations -
      p.contradictions
    ) /
    p.lenses;


  const V =
    Math.min(
      1,
      p.confirmations / 3
    );


  const F =
    M *
    V;


  return {
    W,
    M,
    V,
    F
  };

}


/* =========================================================
   PUBLISH
========================================================= */

async function publishStory(
  payload,
  purification
) {

  const user =
    auth.currentUser;


  const story = {

    title:
      payload.title,

    summary:
      summary(
        payload.bodyText
      ),

    bodyHtml:
      payload.bodyHtml,

    bodyText:
      payload.bodyText,

    category:
      "Field Notes",

    location:
      "Nigeria",

    topic:
      "",

    status:
      "PURIFIED",

    purificationVersion:
      "Legacy Formula v1",

    purification: {

      W:
        purification.W,

      M:
        purification.M,

      V:
        purification.V,

      F:
        purification.F

    },

    sourceType:
      "Legacy Data Collector Workstation",

    authorId:
      user.uid,

    authorName:
      getUserName(
        user
      ),

    createdAt:
      serverTimestamp()

  };


  try {

    const reference =
      await addDoc(
        collection(
          db,
          "stories"
        ),
        story
      );


    const localStory = {

      ...story,

      id:
        reference.id,

      createdAt:
        new Date()
          .toISOString()

    };


    const local =
      getLocalStories();


    local.unshift(
      localStory
    );


    saveLocalStories(
      local
    );


    showToast(
      "✓ Legacy Story published."
    );


    await loadStories();


    setTimeout(
      () => {

        purificationStatus?.classList.remove(
          "active"
        );


        showStories();

      },
      900
    );

  }
  catch (error) {

    console.error(
      "[Legacy] Firestore publish:",
      error
    );


    /*
      You can still test the entire MVP even
      if Firestore rules aren't finished.
    */

    const localStory = {

      ...story,

      id:
        "local_" +
        Date.now(),

      createdAt:
        new Date()
          .toISOString()

    };


    const local =
      getLocalStories();


    local.unshift(
      localStory
    );


    saveLocalStories(
      local
    );


    showToast(
      "Story saved on this device."
    );


    await loadStories();

  }

}


/* =========================================================
   STORIES
========================================================= */

async function loadStories() {

  let firestoreStories =
    [];


  try {

    const storyQuery =
      query(
        collection(
          db,
          "stories"
        ),
        orderBy(
          "createdAt",
          "desc"
        ),
        limit(50)
      );


    const snap =
      await getDocs(
        storyQuery
      );


    firestoreStories =
      snap.docs.map(
        doc => ({

          id:
            doc.id,

          ...doc.data()

        })
      );

  }
  catch (
    error
  ) {

    console.warn(
      "[Legacy] Firestore unavailable:",
      error
    );

  }


  const localStories =
    getLocalStories();


  const combined = [
    ...localStories,
    ...firestoreStories,
    ...fallbackStories
  ];


  renderStories(
    landingStoriesGrid,
    combined
  );


  renderStories(
    authenticatedStoriesGrid,
    combined
  );

}


function renderStories(
  container,
  stories
) {

  if (!container)
    return;


  container.innerHTML =
    stories
      .map(
        story =>
          storyCard(
            story
          )
      )
      .join("");

}


function storyCard(
  story
) {

  const title =
    escapeHtml(
      story.title ||
      "Untitled Story"
    );


  const text =
    escapeHtml(
      story.summary ||
      story.bodyText?.slice(
        0,
        260
      ) ||
      ""
    );


  const category =
    escapeHtml(
      story.category ||
      "Field Notes"
    );


  const location =
    escapeHtml(
      story.location ||
      "Nigeria"
    );


  let score =
    "PURIFIED";


  if (
    story.purification?.F !==
    undefined
  ) {

    score =
      "SCORE " +
      Number(
        story.purification.F
      ).toFixed(2);

  }


  return `

    <article
      class="story-card"
      data-story-category="${category}"
    >

      <div class="story-meta">

        <span class="story-category">
          ${category.toUpperCase()}
        </span>


        <span class="story-status">
          ● ${escapeHtml(score)}
        </span>

      </div>


      <h3>
        ${title}
      </h3>


      <p>
        ${text}
      </p>


      <div class="story-footer">

        <span>
          ${location}
        </span>


        <span
          style="
            color:white;
            font-weight:700;
          "
        >
          Read Story
        </span>

      </div>

    </article>

  `;

}


/* =========================================================
   STORY FILTERS
========================================================= */

document
  .querySelectorAll(
    ".filter-btn"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".filter-btn"
            )
            .forEach(
              b =>
                b.classList.remove(
                  "active"
                )
            );


          button.classList.add(
            "active"
          );


          const category =
            button.dataset.category;


          document
            .querySelectorAll(
              "#landing-stories-grid .story-card"
            )
            .forEach(
              card => {

                const cardCategory =
                  card.dataset.storyCategory ||
                  "";


                card.style.display =
                  category === "all" ||
                  cardCategory.toLowerCase() ===
                    String(
                      category
                    ).toLowerCase()
                    ? "flex"
                    : "none";

              }
            );

        }
      );

    }
  );


/* =========================================================
   LOCAL STORY FALLBACK
========================================================= */

function getLocalStories() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "legacy_local_stories"
      ) ||
      "[]"
    );

  }
  catch {

    return [];

  }

}


function saveLocalStories(
  stories
) {

  localStorage.setItem(
    "legacy_local_stories",
    JSON.stringify(
      stories.slice(
        0,
        50
      )
    )
  );

}


/* =========================================================
   UTILS
========================================================= */

function summary(
  text
) {

  const clean =
    String(
      text || ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();


  return clean.length <= 280
    ? clean
    : clean
        .slice(
          0,
          277
        )
        .trim() +
      "...";

}


function escapeHtml(
  value
) {

  const node =
    document.createElement(
      "div"
    );


  node.textContent =
    String(
      value ?? ""
    );


  return node.innerHTML;

}


function today() {

  return new Date()
    .toISOString()
    .slice(
      0,
      10
    );

}


function sleep(
  ms
) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );

}


function friendlyAuthError(
  error
) {

  const code =
    error?.code ||
    "";


  if (
    code.includes(
      "unauthorized-domain"
    )
  ) {

    return (
      "Firebase has not authorized this website domain."
    );

  }


  if (
    code.includes(
      "operation-not-allowed"
    )
  ) {

    return (
      "Google sign-in is disabled in Firebase."
    );

  }


  if (
    code.includes(
      "popup-blocked"
    )
  ) {

    return (
      "Google popup was blocked."
    );

  }


  if (
    code.includes(
      "popup-closed-by-user"
    )
  ) {

    return (
      "Google sign-in was closed."
    );

  }


  if (
    code.includes(
      "email-already-in-use"
    )
  ) {

    return (
      "That email is already registered. Sign in instead."
    );

  }


  if (
    code.includes(
      "invalid-credential"
    )
  ) {

    return (
      "Those login details are not correct."
    );

  }


  if (
    code.includes(
      "weak-password"
    )
  ) {

    return (
      "Password must be at least 6 characters."
    );

  }


  return (
    error?.message ||
    code ||
    "Something went wrong."
  );

}


/* =========================================================
   INITIALIZE
========================================================= */

if (storyDate) {

  storyDate.value =
    today();

}


loadStories();
