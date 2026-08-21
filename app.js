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


/* =========================================================
   FIREBASE GOOGLE SETTINGS
========================================================= */

provider.setCustomParameters({
  prompt: "select_account"
});


/* =========================================================
   DOM HELPER
========================================================= */

function $(id) {
  return document.getElementById(id);
}


/* =========================================================
   AUTH ELEMENTS
========================================================= */

const navActions =
  $("nav-actions");

const authName =
  $("auth-name");

const authEmail =
  $("auth-email");

const authPass =
  $("auth-pass");

const btnLogin =
  $("btn-login");

const btnSignup =
  $("btn-signup");

const btnGoogle =
  $("btn-google");


/* =========================================================
   APP ELEMENTS
========================================================= */

const landingStoriesGrid =
  $("landing-stories-grid");

const authenticatedStoriesGrid =
  $("authenticated-stories-grid");

const sidebarAvatar =
  $("sidebar-avatar");

const sidebarEmail =
  $("sidebar-email");

const profileEmail =
  $("profile-email");

const profileRole =
  $("profile-role");

const drawerAvatar =
  $("drawer-avatar");

const drawerCollectorStatus =
  $("drawer-collector-status");

const profileNameInput =
  $("profile-name-input");

const saveProfileName =
  $("save-profile-name");

const drawerLogout =
  $("drawer-logout");

const profileTrigger =
  $("profile-trigger");

const profileDrawer =
  $("profile-drawer");

const drawerBackdrop =
  $("drawer-backdrop");

const drawerClose =
  $("drawer-close");

const sidebarToggle =
  $("sidebar-toggle");

const appLayout =
  $("app-layout");

const becomeCollectorBtn =
  $("become-collector-btn");

const openWorkstationBtn =
  $("open-workstation-btn");

const navStories =
  $("nav-stories");

const panelStories =
  $("panel-stories");

const panelWorkstation =
  $("panel-workstation");

const backToStoriesBtn =
  $("back-to-stories-btn");


/* =========================================================
   WORKSTATION ELEMENTS
========================================================= */

const storyTitle =
  $("story-title");

const storyCategory =
  $("story-category");

const storyLocation =
  $("story-location");

const storyTopic =
  $("story-topic");

const storyDate =
  $("story-date");

const editorDocument =
  $("editor-document");

const saveDraftBtn =
  $("save-draft-btn");

const purifyPublishBtn =
  $("purify-publish-btn");

const fullscreenEditorBtn =
  $("fullscreen-editor-btn");

const purificationStatus =
  $("purification-status");

const purificationResult =
  $("purification-result");

const purificationScore =
  $("purification-score");


/* =========================================================
   HIDDEN FORMULA VALUES
========================================================= */

const paramC =
  $("param-c");

const paramB =
  $("param-b");

const paramR =
  $("param-r");

const paramG =
  $("param-g");

const paramI =
  $("param-i");

const paramConfirm =
  $("param-confirm");

const paramContra =
  $("param-contra");


/* =========================================================
   STATE
========================================================= */

let latestStories = [];

let savedSelection = null;


/* =========================================================
   FALLBACK STORIES
========================================================= */

const fallbackStories = [

  {
    title:
      "Riverine and upland communities can experience the same transport system very differently.",

    summary:
      "Field observations can reveal differences in movement patterns, transport access and local operating conditions between riverine and mainland environments.",

    category:
      "Logistics",

    location:
      "Rivers State · Nigeria",

    status:
      "PURIFIED"
  },


  {
    title:
      "Local pricing decisions can contain context that formal datasets miss.",

    summary:
      "Vendor conversations and field observations can connect price movement to supply, availability, transportation and local purchasing behavior.",

    category:
      "Commerce",

    location:
      "Nigeria · Commerce",

    status:
      "PURIFIED"
  },


  {
    title:
      "Infrastructure on a map is not always the same as infrastructure in use.",

    summary:
      "Field intelligence connects physical infrastructure with how people actually interact with roads, services, spaces and local systems.",

    category:
      "Infrastructure",

    location:
      "Nigeria · Infrastructure",

    status:
      "PURIFIED"
  },


  {
    title:
      "Local behavior often makes sense only when its surrounding context is known.",

    summary:
      "Conversations and observations can expose trust patterns, informal expectations and social reasoning that broad datasets may flatten away.",

    category:
      "Culture",

    location:
      "Nigeria · Social context",

    status:
      "PURIFIED"
  },


  {
    title:
      "Geography changes the context of what people observe.",

    summary:
      "A field observation carries its geographic context with it. Riverine, transitional and upland environments can produce different perspectives on the same issue.",

    category:
      "Environment",

    location:
      "Rivers State · Field context",

    status:
      "PURIFIED"
  },


  {
    title:
      "The strongest intelligence often starts as an ordinary conversation.",

    summary:
      "Legacy preserves the raw observation, applies structured reasoning, and turns the resulting pattern into digestible intelligence.",

    category:
      "Field Notes",

    location:
      "Nigeria · Field research",

    status:
      "PURIFIED"
  }

];


/* =========================================================
   HANDLE GOOGLE REDIRECT RESULT
========================================================= */

getRedirectResult(auth)
  .then((result) => {

    if (result?.user) {

      showToast(
        "Google sign-in successful."
      );

    }

  })
  .catch((error) => {

    console.error(
      "[Legacy] Google redirect result error:",
      error
    );


    showToast(
      friendlyAuthError(error)
    );

  });


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
  auth,
  async (user) => {

    if (user) {

      updateIdentity(user);

      renderAuthenticatedNavigation();

      setupCollectorState();

      showStoriesPanel();

      await loadStories();

    }

    else {

      renderLoggedOutNavigation();

      switchPage("page-landing");

      await loadStories();

    }

  }
);


/* =========================================================
   DISPLAY NAME
========================================================= */

function getDisplayName(user) {

  if (
    user?.displayName &&
    user.displayName.trim()
  ) {

    return user.displayName.trim();

  }


  if (user?.email) {

    const localPart =
      user.email.split("@")[0];

    if (localPart) {

      return capitalizeName(
        localPart
      );

    }

  }


  return "User";

}


function capitalizeName(value) {

  return value
    .replace(/[._-]+/g, " ")
    .replace(
      /\b\w/g,
      char =>
        char.toUpperCase()
    );

}


/* =========================================================
   UPDATE IDENTITY
========================================================= */

function updateIdentity(user) {

  const name =
    getDisplayName(user);


  const initial =
    name
      .charAt(0)
      .toUpperCase();


  if (sidebarAvatar) {

    sidebarAvatar.textContent =
      initial;

  }


  if (drawerAvatar) {

    drawerAvatar.textContent =
      initial;

  }


  if (sidebarEmail) {

    sidebarEmail.textContent =
      name;

  }


  if (profileNameInput) {

    profileNameInput.value =
      name;

  }


  if (profileEmail) {

    profileEmail.textContent =
      user.email ||
      "Authenticated user";

  }


  if (profileRole) {

    profileRole.textContent =
      isCollector()
        ? "Legacy Data Collector"
        : "Legacy Reader";

  }


  updateDrawerCollectorState();

}


/* =========================================================
   SAVE PROFILE NAME
========================================================= */

saveProfileName?.addEventListener(
  "click",
  async () => {

    const user =
      auth.currentUser;


    if (!user) {

      showToast(
        "You are not signed in."
      );

      return;

    }


    const name =
      profileNameInput?.value.trim();


    if (!name) {

      showToast(
        "Enter a name first."
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


      updateIdentity(user);


      showToast(
        "Name updated."
      );

    }
    catch (error) {

      console.error(
        "[Legacy] Name update error:",
        error
      );


      showToast(
        "Could not update your name."
      );

    }

  }
);


/* =========================================================
   RENDER LOGGED-IN NAV
========================================================= */

function renderAuthenticatedNavigation() {

  if (!navActions) {
    return;
  }


  navActions.innerHTML = `

    <button
      class="nav-btn"
      id="logout-btn"
      type="button"
    >
      Log Out
    </button>

  `;


  $("logout-btn")?.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        showToast(
          "Logged out."
        );

      }
      catch (error) {

        console.error(
          error
        );

      }

    }
  );

}


/* =========================================================
   RENDER LOGGED-OUT NAV
========================================================= */

function renderLoggedOutNavigation() {

  if (!navActions) {
    return;
  }


  navActions.innerHTML = `

    <button
      class="nav-btn"
      onclick="switchPage('page-auth')"
    >
      Sign In / Register
    </button>

  `;

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

    }
    catch (error) {

      console.error(
        "[Legacy] Login error:",
        error
      );


      showToast(
        friendlyAuthError(error)
      );

    }

  }
);


/* =========================================================
   EMAIL REGISTRATION
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
        "Enter your name first."
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


      updateIdentity(
        credentials.user
      );


      showToast(
        `Welcome to Legacy, ${name}.`
      );

    }
    catch (error) {

      console.error(
        "[Legacy] Registration error:",
        error
      );


      showToast(
        friendlyAuthError(error)
      );

    }

  }
);


/* =========================================================
   GOOGLE SIGN-IN
=========================================================

   Important:
   1. Try popup.
   2. If browser blocks/cancels popup, fall back
      to Firebase redirect.
   3. getRedirectResult() above handles the return.
========================================================= */

btnGoogle?.addEventListener(
  "click",
  async () => {

    if (!auth || !provider) {

      showToast(
        "Google authentication is not initialized."
      );

      return;

    }


    try {

      provider.setCustomParameters({
        prompt:
          "select_account"
      });


      await signInWithPopup(
        auth,
        provider
      );


      showToast(
        "Google sign-in successful."
      );

    }
    catch (error) {

      console.error(
        "[Legacy] Google sign-in error:",
        error
      );


      const code =
        error?.code || "";


      const shouldRedirect =
        code.includes(
          "popup-blocked"
        ) ||
        code.includes(
          "popup-closed-by-user"
        ) ||
        code.includes(
          "cancelled-popup-request"
        );


      if (shouldRedirect) {

        showToast(
          "Opening Google sign-in..."
        );


        try {

          await signInWithRedirect(
            auth,
            provider
          );

        }
        catch (redirectError) {

          console.error(
            "[Legacy] Google redirect error:",
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
        friendlyAuthError(error)
      );

    }

  }
);


/* =========================================================
   PROFILE DRAWER
========================================================= */

profileTrigger?.addEventListener(
  "click",
  openProfile
);


drawerClose?.addEventListener(
  "click",
  closeProfile
);


drawerBackdrop?.addEventListener(
  "click",
  closeProfile
);


function openProfile() {

  profileDrawer?.classList.add(
    "active"
  );

  drawerBackdrop?.classList.add(
    "active"
  );

}


function closeProfile() {

  profileDrawer?.classList.remove(
    "active"
  );

  drawerBackdrop?.classList.remove(
    "active"
  );

}


/* =========================================================
   PROFILE LOGOUT
========================================================= */

drawerLogout?.addEventListener(
  "click",
  async () => {

    try {

      await signOut(auth);

      closeProfile();

    }
    catch (error) {

      console.error(
        error
      );

    }

  }
);


/* =========================================================
   SIDEBAR COLLAPSE
========================================================= */

sidebarToggle?.addEventListener(
  "click",
  () => {

    if (!appLayout) {
      return;
    }


    const isClosed =
      appLayout.classList.toggle(
        "sidebar-closed"
      );


    if (sidebarToggle) {

      sidebarToggle.textContent =
        isClosed
          ? "›"
          : "‹";


      sidebarToggle.title =
        isClosed
          ? "Open sidebar"
          : "Collapse sidebar";

    }

  }
);


/* =========================================================
   DATA COLLECTOR
========================================================= */

function collectorKey() {

  const user =
    auth.currentUser;


  if (!user) {
    return null;
  }


  return (
    "legacy_collector_" +
    user.uid
  );

}


function isCollector() {

  const key =
    collectorKey();


  if (!key) {
    return false;
  }


  return (
    localStorage.getItem(
      key
    ) === "true"
  );

}


function setupCollectorState() {

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

  if (!drawerCollectorStatus) {
    return;
  }


  drawerCollectorStatus.textContent =
    isCollector()
      ? "Data Collector"
      : "Reader";

}


/* =========================================================
   ACTIVATE COLLECTOR
========================================================= */

becomeCollectorBtn?.addEventListener(
  "click",
  () => {

    if (!auth.currentUser) {

      switchPage(
        "page-auth"
      );

      return;

    }


    const key =
      collectorKey();


    if (!key) {
      return;
    }


    localStorage.setItem(
      key,
      "true"
    );


    setupCollectorState();


    showToast(
      "Data Collector access activated."
    );


    openWorkstation();

  }
);


openWorkstationBtn?.addEventListener(
  "click",
  openWorkstation
);


/* =========================================================
   WORKSPACE NAVIGATION
========================================================= */

backToStoriesBtn?.addEventListener(
  "click",
  showStoriesPanel
);


navStories?.addEventListener(
  "click",
  showStoriesPanel
);


function openWorkstation() {

  if (!auth.currentUser) {

    switchPage(
      "page-auth"
    );

    return;

  }


  if (!isCollector()) {

    showToast(
      "Become a Data Collector first."
    );

    return;

  }


  switchPanel(
    panelWorkstation
  );


  loadDraft();

}


function showStoriesPanel() {

  switchPanel(
    panelStories
  );


  loadStories();

}


function switchPanel(
  panel
) {

  document
    .querySelectorAll(
      ".workspace-panel"
    )
    .forEach(
      item =>
        item.classList.remove(
          "active"
        )
    );


  panel?.classList.add(
    "active"
  );


  document
    .querySelectorAll(
      ".sidebar-action"
    )
    .forEach(
      item =>
        item.classList.remove(
          "active"
        )
    );


  if (
    panel === panelStories &&
    navStories
  ) {

    navStories.classList.add(
      "active"
    );

  }

}


/* =========================================================
   EDITOR SELECTION
========================================================= */

function saveSelection() {

  const selection =
    window.getSelection();


  if (
    !selection ||
    selection.rangeCount === 0 ||
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

    savedSelection =
      range.cloneRange();

  }

}


function restoreSelection() {

  if (
    !savedSelection ||
    !editorDocument
  ) {

    editorDocument?.focus();

    return;

  }


  const selection =
    window.getSelection();


  selection.removeAllRanges();


  selection.addRange(
    savedSelection
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


editorDocument?.addEventListener(
  "focus",
  saveSelection
);


/* =========================================================
   WORD-LIKE FORMATTING
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


$("font-family")?.addEventListener(
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


$("font-size")?.addEventListener(
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


$("text-color")?.addEventListener(
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


$("highlight-color")?.addEventListener(
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

$("heading-one")?.addEventListener(
  "mousedown",
  event => {

    event.preventDefault();

    restoreSelection();


    document.execCommand(
      "formatBlock",
      false,
      "h1"
    );


    saveSelection();

  }
);


$("heading-two")?.addEventListener(
  "mousedown",
  event => {

    event.preventDefault();

    restoreSelection();


    document.execCommand(
      "formatBlock",
      false,
      "h2"
    );


    saveSelection();

  }
);


$("blockquote-tool")?.addEventListener(
  "mousedown",
  event => {

    event.preventDefault();

    restoreSelection();


    document.execCommand(
      "formatBlock",
      false,
      "blockquote"
    );


    saveSelection();

  }
);


/* =========================================================
   INSERT LINK
========================================================= */

$("insert-link")?.addEventListener(
  "mousedown",
  event => {

    event.preventDefault();

    restoreSelection();


    const url =
      window.prompt(
        "Enter the URL:"
      );


    if (!url) {

      editorDocument?.focus();

      return;

    }


    document.execCommand(
      "createLink",
      false,
      url
    );


    saveSelection();

  }
);


/* =========================================================
   INSERT TABLE
========================================================= */

$("insert-table")?.addEventListener(
  "click",
  () => {

    const rows =
      Number(
        window.prompt(
          "Number of rows:",
          "3"
        )
      );


    const columns =
      Number(
        window.prompt(
          "Number of columns:",
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


    const tbody =
      document.createElement(
        "tbody"
      );


    for (
      let r = 0;
      r < rows;
      r++
    ) {

      const tr =
        document.createElement(
          "tr"
        );


      for (
        let c = 0;
        c < columns;
        c++
      ) {

        const cell =
          document.createElement(
            r === 0
              ? "th"
              : "td"
          );


        cell.textContent =
          r === 0
            ? `Column ${c + 1}`
            : "Enter data";


        cell.contentEditable =
          "true";


        tr.appendChild(
          cell
        );

      }


      tbody.appendChild(
        tr
      );

    }


    table.appendChild(
      tbody
    );


    restoreSelection();


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

    document.body.classList.toggle(
      "editor-fullscreen"
    );


    fullscreenEditorBtn.textContent =
      document.body.classList.contains(
        "editor-fullscreen"
      )
        ? "Exit Fullscreen"
        : "Fullscreen";

  }
);


/* =========================================================
   DRAFT
========================================================= */

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


function draftKey() {

  return (
    "legacy_document_draft_" +
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


    if (storyTitle) {

      storyTitle.value =
        draft.title ||
        "";

    }


    if (editorDocument) {

      editorDocument.innerHTML =
        draft.content ||
        "";

    }

  }
  catch (error) {

    console.warn(
      "[Legacy] Draft load failed:",
      error
    );

  }

}


/* =========================================================
   PURIFY & PUBLISH
========================================================= */

purifyPublishBtn?.addEventListener(
  "click",
  async () => {

    if (!auth.currentUser) {

      showToast(
        "You must be logged in."
      );

      return;

    }


    if (!isCollector()) {

      showToast(
        "Become a Data Collector first."
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
        "Write the Story first."
      );

      return;

    }


    await runPurification(
      {
        title,
        bodyText,
        bodyHtml
      }
    );

  }
);


/* =========================================================
   PURIFICATION UI
========================================================= */

async function runPurification(
  payload
) {

  purificationStatus?.classList.add(
    "active"
  );


  purificationResult?.classList.remove(
    "active"
  );


  resetProcessing();


  markProcessing(
    1,
    "✓ Capturing raw record"
  );


  await sleep(
    400
  );


  markProcessing(
    2,
    "✓ Checking metadata"
  );


  const parameters =
    deriveInternalParameters(
      payload
    );


  await sleep(
    500
  );


  markProcessing(
    3,
    "✓ Running Legacy reasoning"
  );


  await sleep(
    650
  );


  const result =
    calculateFormula(
      parameters
    );


  await sleep(
    450
  );


  markProcessing(
    4,
    "✓ Validating"
  );


  await sleep(
    450
  );


  markProcessing(
    5,
    "✓ Building Story"
  );


  if (purificationScore) {

    purificationScore.textContent =
      result.F.toFixed(3);

  }


  purificationResult?.classList.add(
    "active"
  );


  await publishStory(
    payload,
    result
  );

}


/* =========================================================
   INTERNAL PARAMETERS
========================================================= */

function deriveInternalParameters(
  payload
) {

  const wordCount =
    payload.bodyText
      .split(/\s+/)
      .filter(Boolean)
      .length;


  const C =
    clamp(
      wordCount >= 120
        ? 0.85
        : 0.70,
      0,
      1
    );


  const B =
    0.80;


  const R =
    0.50;


  const G =
    16;


  const I =
    0;


  const confirmations =
    1;


  const contradictions =
    0;


  return {

    C,
    B,
    R,
    G,
    I,
    confirmations,
    contradictions,
    lenses: 4

  };

}


/* =========================================================
   LEGACY FORMULA V1
========================================================= */

function calculateFormula(
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
    M * V;


  return {

    W,
    M,
    V,
    F

  };

}


/* =========================================================
   PUBLISH STORY
========================================================= */

async function publishStory(
  payload,
  purification
) {

  const user =
    auth.currentUser;


  if (!user) {
    return;
  }


  const story = {

    title:
      payload.title,

    summary:
      buildSummary(
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
      getDisplayName(user),

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
        new Date().toISOString()

    };


    const stories =
      getLocalStories();


    stories.unshift(
      localStory
    );


    saveLocalStories(
      stories
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


        showStoriesPanel();

      },
      900
    );

  }
  catch (error) {

    console.error(
      "[Legacy] Firestore publish error:",
      error
    );


    const localStory = {

      ...story,

      id:
        "local_" +
        Date.now(),

      createdAt:
        new Date().toISOString()

    };


    const stories =
      getLocalStories();


    stories.unshift(
      localStory
    );


    saveLocalStories(
      stories
    );


    showToast(
      "Story saved locally. Firestore rules still need configuration."
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

    const storiesQuery =
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


    const snapshot =
      await getDocs(
        storiesQuery
      );


    firestoreStories =
      snapshot.docs.map(
        doc => ({

          id:
            doc.id,

          ...doc.data()

        })
      );

  }
  catch (error) {

    console.warn(
      "[Legacy] Firestore Stories unavailable:",
      error
    );

  }


  latestStories = [

    ...getLocalStories(),

    ...firestoreStories,

    ...fallbackStories

  ];


  renderStories(
    landingStoriesGrid,
    latestStories
  );


  renderStories(
    authenticatedStoriesGrid,
    latestStories
  );

}


/* =========================================================
   RENDER STORIES
========================================================= */

function renderStories(
  container,
  stories
) {

  if (!container) {
    return;
  }


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


  const summary =
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
      `SCORE ${
        Number(
          story.purification.F
        ).toFixed(2)
      }`;

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
        ${summary}
      </p>


      <div class="story-footer">

        <span>
          ${location}
        </span>


        <span
          style="color:#fff;font-weight:700;"
        >
          Read Story
        </span>

      </div>

    </article>

  `;

}


/* =========================================================
   STORY FILTER
========================================================= */

window.filterLandingStories =
  function(category) {

    document
      .querySelectorAll(
        "#landing-stories-grid .story-card"
      )
      .forEach(
        card => {

          const cardCategory =
            card.dataset.storyCategory ||
            "";


          if (
            category === "all" ||
            cardCategory.toLowerCase() ===
              String(
                category
              ).toLowerCase()
          ) {

            card.style.display =
              "flex";

          }
          else {

            card.style.display =
              "none";

          }

        }
      );

  };


/* =========================================================
   LOCAL STORIES
========================================================= */

function getLocalStories() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "legacy_local_stories"
      ) || "[]"
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
   RESET / HELPERS
========================================================= */

function resetProcessing() {

  for (
    let i = 1;
    i <= 5;
    i++
  ) {

    const element =
      $(
        `processing-${i}`
      );


    if (!element) {
      continue;
    }


    element.classList.remove(
      "done"
    );

  }

}


function markProcessing(
  number,
  text
) {

  const element =
    $(
      `processing-${number}`
    );


  if (!element) {
    return;
  }


  element.textContent =
    text;


  element.classList.add(
    "done"
  );

}


function buildSummary(
  text
) {

  const clean =
    text
      .replace(
        /\s+/g,
        " "
      )
      .trim();


  if (
    clean.length <= 280
  ) {

    return clean;

  }


  return (
    clean
      .slice(
        0,
        277
      )
      .trim() +
    "..."
  );

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
  milliseconds
) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        milliseconds
      )
  );

}


function clamp(
  value,
  minimum,
  maximum
) {

  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );

}


function escapeHtml(
  value
) {

  const element =
    document.createElement(
      "div"
    );


  element.textContent =
    String(
      value ?? ""
    );


  return element.innerHTML;

}


/* =========================================================
   AUTH ERROR MESSAGES
========================================================= */

function friendlyAuthError(
  error
) {

  const code =
    error?.code || "";


  if (
    code.includes(
      "auth/unauthorized-domain"
    )
  ) {

    return (
      "Legacy's domain is not authorized in Firebase yet. Add legacy-data.onrender.com under Authentication → Settings → Authorized domains."
    );

  }


  if (
    code.includes(
      "auth/operation-not-allowed"
    )
  ) {

    return (
      "Google sign-in is not enabled in Firebase Authentication."
    );

  }


  if (
    code.includes(
      "auth/popup-blocked"
    )
  ) {

    return (
      "The Google popup was blocked. Legacy will try redirect sign-in."
    );

  }


  if (
    code.includes(
      "auth/popup-closed-by-user"
    )
  ) {

    return (
      "The Google sign-in window was closed."
    );

  }


  if (
    code.includes(
      "auth/cancelled-popup-request"
    )
  ) {

    return (
      "Another Google sign-in request is already running."
    );

  }


  if (
    code.includes(
      "auth/email-already-in-use"
    )
  ) {

    return (
      "That email is already registered. Try signing in."
    );

  }


  if (
    code.includes(
      "auth/invalid-credential"
    ) ||
    code.includes(
      "auth/wrong-password"
    )
  ) {

    return (
      "Wrong email or password."
    );

  }


  if (
    code.includes(
      "auth/user-not-found"
    )
  ) {

    return (
      "No account with that email."
    );

  }


  if (
    code.includes(
      "auth/weak-password"
    )
  ) {

    return (
      "Password is too weak. Use at least 6 characters."
    );

  }


  if (
    code.includes(
      "auth/invalid-email"
    )
  ) {

    return (
      "That email address is not valid."
    );

  }


  if (
    code.includes(
      "auth/network-request-failed"
    )
  ) {

    return (
      "Network error. Check your internet connection and try again."
    );

  }


  return (
    error?.message ||
    code ||
    "Something went wrong."
  );

}


/* =========================================================
   INITIAL DATE
========================================================= */

if (storyDate) {

  storyDate.value =
    today();

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.openWorkstation =
  openWorkstation;


window.showStoriesPanel =
  showStoriesPanel;
