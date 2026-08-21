import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
  apiKey: "AIzaSyDh9vQKIIKNWTl8GfjLgNzksEWBUIY6mYs",
  authDomain: "lega-10e72.firebaseapp.com",
  projectId: "lega-10e72",
  storageBucket: "lega-10e72.firebasestorage.app",
  messagingSenderId: "64220913818",
  appId: "1:64220913818:web:c0362b644a52e70ad8ff23",
  measurementId: "G-YHZYTJKGF5"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const provider = new GoogleAuthProvider();


/* =========================================================
   SAFE DOM GETTER
========================================================= */

function $(id) {

  const element =
    document.getElementById(id);

  if (!element) {

    console.warn(
      `[Legacy] Missing element: #${id}`
    );

  }

  return element;
}


/* =========================================================
   DOM
========================================================= */

const navActions =
  $("nav-actions");

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

const profileAvatar =
  $("profile-avatar");

const profileEmail =
  $("profile-email");

const landingStoriesGrid =
  $("landing-stories-grid");

const authenticatedStoriesGrid =
  $("authenticated-stories-grid");

const becomeCollectorBtn =
  $("become-collector-btn");

const openWorkstationBtn =
  $("open-workstation-btn");

const collectorDisabled =
  $("collector-disabled");

const collectorEnabled =
  $("collector-enabled");

const navStories =
  $("nav-stories");

const panelStories =
  $("panel-stories");

const panelWorkstation =
  $("panel-workstation");

const backToStoriesBtn =
  $("back-to-stories-btn");

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

const purificationProgress =
  $("purification-progress");

const purificationResult =
  $("purification-result");

const resultScore =
  $("result-score");

const resultW =
  $("result-w");

const resultM =
  $("result-m");

const resultV =
  $("result-v");

const resultConfirm =
  $("result-confirm");

const resultContra =
  $("result-contra");

const runPurificationBtn =
  $("run-purification-btn");

const publishStoryBtn =
  $("publish-story-btn");

const saveDraftBtn =
  $("save-draft-btn");

const toolBold =
  $("tool-bold");

const toolItalic =
  $("tool-italic");

const toolHeading =
  $("tool-heading");

const toolQuote =
  $("tool-quote");

const toolTable =
  $("tool-table");

const toolChart =
  $("tool-chart");

const toolClear =
  $("tool-clear");

const chartBuilder =
  $("chart-builder");

const chartDataRows =
  $("chart-data-rows");

const addChartRowBtn =
  $("add-chart-row");

const renderChartBtn =
  $("render-chart");

const chartCanvasWrap =
  $("chart-canvas-wrap");

const chartCanvas =
  $("legacy-chart");


/* =========================================================
   STATE
========================================================= */

let latestStories = [];

let latestPurification = null;


/* =========================================================
   DEFAULT STORIES
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

    purifiedScore:
      null,

    status:
      "PURIFIED",

    source:
      "Legacy field intelligence"
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

    purifiedScore:
      null,

    status:
      "PURIFIED",

    source:
      "Legacy field intelligence"
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

    purifiedScore:
      null,

    status:
      "PURIFIED",

    source:
      "Legacy field intelligence"
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

    purifiedScore:
      null,

    status:
      "PURIFIED",

    source:
      "Legacy field intelligence"
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

    purifiedScore:
      null,

    status:
      "PURIFIED",

    source:
      "Legacy field intelligence"
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

    purifiedScore:
      null,

    status:
      "PURIFIED",

    source:
      "Legacy field intelligence"
  }

];


/* =========================================================
   AUTH
========================================================= */

onAuthStateChanged(auth, async (user) => {

  if (user) {

    const initial =
      (
        user.displayName ||
        user.email ||
        "U"
      )
        .charAt(0)
        .toUpperCase();


    if (profileAvatar) {

      profileAvatar.textContent =
        initial;

    }


    if (profileEmail) {

      profileEmail.textContent =
        user.email ||
        "Authenticated user";

    }


    if (navActions) {

      navActions.innerHTML = `

        <button
          class="nav-btn"
          id="logout-btn"
        >
          Log Out
        </button>

      `;


      const logoutBtn =
        $("logout-btn");


      logoutBtn?.addEventListener(
        "click",
        () => {

          signOut(auth)
            .catch((error) => {

              console.error(
                "Sign out error:",
                error
              );

            });

        }
      );

    }


    switchPage("page-app");

    setupCollectorState();

    showStoriesPanel();

    await loadStories();

  }

  else {

    if (navActions) {

      navActions.innerHTML = `

        <button
          class="nav-btn"
          onclick="switchPage('page-auth')"
        >
          Sign In / Register
        </button>

      `;

    }

    switchPage("page-landing");

    await loadStories();

  }

});


/* =========================================================
   EMAIL LOGIN
========================================================= */

if (btnLogin) {

  btnLogin.addEventListener(
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
          "Login error:",
          error
        );

        showToast(
          friendlyAuthError(error)
        );

      }

    }
  );

}


/* =========================================================
   EMAIL REGISTER
========================================================= */

if (btnSignup) {

  btnSignup.addEventListener(
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


      if (password.length < 6) {

        showToast(
          "Password needs at least 6 characters."
        );

        return;

      }


      try {

        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      }

      catch (error) {

        console.error(
          "Register error:",
          error
        );

        showToast(
          friendlyAuthError(error)
        );

      }

    }
  );

}


/* =========================================================
   GOOGLE AUTH
========================================================= */

if (btnGoogle) {

  btnGoogle.addEventListener(
    "click",
    async () => {

      try {

        await signInWithPopup(
          auth,
          provider
        );

      }

      catch (error) {

        console.error(
          "Google auth error:",
          error
        );

        showToast(
          friendlyAuthError(error)
        );

      }

    }
  );

}


/* =========================================================
   COLLECTOR STATE
   MVP: local browser permission.
========================================================= */

function collectorKey() {

  const user =
    auth.currentUser;

  if (!user) return null;

  return `legacy_collector_${user.uid}`;

}


function isCollector() {

  const key =
    collectorKey();

  if (!key) return false;

  return localStorage.getItem(key)
    === "true";

}


function setupCollectorState() {

  const active =
    isCollector();


  if (active) {

    if (collectorDisabled) {

      collectorDisabled.style.display =
        "none";

    }


    if (collectorEnabled) {

      collectorEnabled.style.display =
        "block";

    }

  }

  else {

    if (collectorDisabled) {

      collectorDisabled.style.display =
        "block";

    }


    if (collectorEnabled) {

      collectorEnabled.style.display =
        "none";

    }

  }

}


/* =========================================================
   BECOME DATA COLLECTOR
========================================================= */

becomeCollectorBtn?.addEventListener(
  "click",
  () => {

    const user =
      auth.currentUser;


    if (!user) {

      switchPage("page-auth");

      return;

    }


    const key =
      collectorKey();


    if (!key) return;


    localStorage.setItem(
      key,
      "true"
    );


    setupCollectorState();

    openWorkstation();

    showToast(
      "Data Collector access activated on this device."
    );

  }
);


/* =========================================================
   WORKSTATION NAVIGATION
========================================================= */

openWorkstationBtn?.addEventListener(
  "click",
  () => {

    openWorkstation();

  }
);


backToStoriesBtn?.addEventListener(
  "click",
  () => {

    showStoriesPanel();

  }
);


navStories?.addEventListener(
  "click",
  () => {

    showStoriesPanel();

  }
);


function openWorkstation() {

  if (!auth.currentUser) {

    switchPage("page-auth");

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

  resetWorkstation();


}


function showStoriesPanel() {

  switchPanel(
    panelStories
  );

  loadStories();

}


function switchPanel(panel) {

  document
    .querySelectorAll(".workspace-panel")
    .forEach((element) => {

      element.classList.remove("active");

    });


  if (panel) {

    panel.classList.add("active");

  }


  document
    .querySelectorAll(".sidebar-action")
    .forEach((button) => {

      button.classList.remove(
        "active"
      );

    });


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
   WORKSTATION RESET
========================================================= */

function resetWorkstation() {

  if (storyTitle) {

    storyTitle.value =
      "";

  }


  if (storyCategory) {

    storyCategory.value =
      "Commerce";

  }


  if (storyLocation) {

    storyLocation.value =
      "";

  }


  if (storyTopic) {

    storyTopic.value =
      "";

  }


  if (storyDate) {

    storyDate.value =
      new Date()
        .toISOString()
        .slice(0, 10);

  }


  if (editorDocument) {

    editorDocument.innerHTML =
      "";

  }


  if (paramC) {

    paramC.value =
      "0.8";

  }


  if (paramB) {

    paramB.value =
      "0.8";

  }


  if (paramR) {

    paramR.value =
      "0.5";

  }


  if (paramG) {

    paramG.value =
      "16";

  }


  if (paramI) {

    paramI.value =
      "0";

  }


  if (paramConfirm) {

    paramConfirm.value =
      "1";

  }


  if (paramContra) {

    paramContra.value =
      "0";

  }


  const intensityValue =
    $("intensity-value");


  if (intensityValue) {

    intensityValue.textContent =
      "0";

  }


  if (purificationProgress) {

    purificationProgress.classList.remove(
      "active"
    );

  }


  if (purificationResult) {

    purificationResult.classList.remove(
      "active"
    );

  }


  if (publishStoryBtn) {

    publishStoryBtn.style.display =
      "none";

  }


  latestPurification =
    null;

}


/* =========================================================
   EDITOR TOOLBAR
========================================================= */

function editorCommand(
  command,
  value = null
) {

  editorDocument?.focus();

  document.execCommand(
    command,
    false,
    value
  );

}


toolBold?.addEventListener(
  "click",
  () => editorCommand("bold")
);


toolItalic?.addEventListener(
  "click",
  () => editorCommand("italic")
);


toolHeading?.addEventListener(
  "click",
  () => editorCommand(
    "formatBlock",
    "h2"
  )
);


toolQuote?.addEventListener(
  "click",
  () => editorCommand(
    "formatBlock",
    "blockquote"
  )
);


/* =========================================================
   TABLE
========================================================= */

toolTable?.addEventListener(
  "click",
  () => {

    if (!editorDocument) return;


    editorDocument.focus();


    const table = document.createElement(
      "table"
    );


    table.innerHTML = `

      <thead>

        <tr>
          <th>Field</th>
          <th>Observation</th>
          <th>Context</th>
        </tr>

      </thead>

      <tbody>

        <tr>
          <td contenteditable="true">
            Example
          </td>

          <td contenteditable="true">
            Enter observation
          </td>

          <td contenteditable="true">
            Enter context
          </td>
        </tr>

        <tr>
          <td contenteditable="true">
            Example
          </td>

          <td contenteditable="true">
            Enter observation
          </td>

          <td contenteditable="true">
            Enter context
          </td>
        </tr>

      </tbody>

    `;


    editorDocument.appendChild(
      table
    );


    const spacer =
      document.createElement("p");


    spacer.innerHTML =
      "<br>";


    editorDocument.appendChild(
      spacer
    );

  }
);


/* =========================================================
   CLEAR EDITOR
========================================================= */

toolClear?.addEventListener(
  "click",
  () => {

    if (!editorDocument) return;


    const confirmed =
      window.confirm(
        "Clear the entire document?"
      );


    if (!confirmed) return;


    editorDocument.innerHTML =
      "";

  }
);


/* =========================================================
   CHART BUILDER
========================================================= */

toolChart?.addEventListener(
  "click",
  () => {

    chartBuilder?.classList.toggle(
      "active"
    );

  }
);


addChartRowBtn?.addEventListener(
  "click",
  () => {

    const row =
      document.createElement("div");


    row.className =
      "chart-data-row";


    row.innerHTML = `

      <input
        placeholder="Label"
      >

      <input
        type="number"
        placeholder="Value"
        value="0"
      >

      <button
        class="remove-row"
        type="button"
      >
        ×
      </button>

    `;


    chartDataRows?.appendChild(
      row
    );

  }
);


chartDataRows?.addEventListener(
  "click",
  (event) => {

    const remove =
      event.target.closest(
        ".remove-row"
      );


    if (!remove) return;


    remove.parentElement.remove();

  }
);


renderChartBtn?.addEventListener(
  "click",
  () => {

    renderLegacyChart();

  }
);


/* =========================================================
   CHART RENDERER
========================================================= */

function renderLegacyChart() {

  if (
    !chartCanvas ||
    !chartDataRows
  ) return;


  const rows =
    Array.from(
      chartDataRows.querySelectorAll(
        ".chart-data-row"
      )
    );


  const data =
    rows
      .map((row) => {

        const inputs =
          row.querySelectorAll(
            "input"
          );


        return {
          label:
            inputs[0]?.value ||
            "Item",

          value:
            Number(
              inputs[1]?.value || 0
            )
        };

      })
      .filter(
        item =>
          Number.isFinite(
            item.value
          )
      );


  if (!data.length) {

    showToast(
      "Add some chart data first."
    );

    return;

  }


  chartCanvas.width =
    800;

  chartCanvas.height =
    420;


  const ctx =
    chartCanvas.getContext(
      "2d"
    );


  ctx.clearRect(
    0,
    0,
    chartCanvas.width,
    chartCanvas.height
  );


  const padding =
    60;

  const width =
    chartCanvas.width -
    padding * 2;

  const height =
    chartCanvas.height -
    padding * 2;


  const max =
    Math.max(
      ...data.map(
        item =>
          item.value
      ),
      1
    );


  ctx.strokeStyle =
    "#30303a";

  ctx.lineWidth =
    2;


  ctx.beginPath();

  ctx.moveTo(
    padding,
    padding
  );

  ctx.lineTo(
    padding,
    chartCanvas.height -
      padding
  );

  ctx.lineTo(
    chartCanvas.width -
      padding,
    chartCanvas.height -
      padding
  );

  ctx.stroke();


  const barGap =
    22;

  const barWidth =
    (
      width -
      barGap *
      (data.length - 1)
    ) /
    data.length;


  data.forEach(
    (item, index) => {

      const barHeight =
        (
          item.value /
          max
        ) *
        height;


      const x =
        padding +
        index *
          (barWidth + barGap);


      const y =
        chartCanvas.height -
        padding -
        barHeight;


      const gradient =
        ctx.createLinearGradient(
          0,
          y,
          0,
          chartCanvas.height -
            padding
        );


      gradient.addColorStop(
        0,
        "#ff0055"
      );


      gradient.addColorStop(
        1,
        "#7a00ff"
      );


      ctx.fillStyle =
        gradient;


      ctx.fillRect(
        x,
        y,
        barWidth,
        barHeight
      );


      ctx.fillStyle =
        "#d8d8df";


      ctx.font =
        "12px sans-serif";


      ctx.textAlign =
        "center";


      ctx.fillText(
        item.label,
        x + barWidth / 2,
        chartCanvas.height -
          padding +
          20
      );


      ctx.fillText(
        String(item.value),
        x + barWidth / 2,
        y - 8
      );

    }
  );


  chartCanvasWrap?.classList.add(
    "active"
  );


  showToast(
    "Chart generated."
  );

}


/* =========================================================
   PURIFICATION FORMULA
=========================================================

   Based directly on the supplied Legacy framework:

   W =
     [(C × B) + R]
     × (1 + Gnorm²)
     × (1 + |I| / 4)

   M =
     W ×
     (Σ confirmations − Σ contradictions)
     / lenses

   V =
     min(1, confirmations / 3)

   F =
     M × V

   Lenses = 4
========================================================= */

function calculateLegacyPurification() {

  const C =
    clamp(
      Number(paramC?.value || 0),
      0,
      1
    );


  const B =
    clamp(
      Number(paramB?.value || 0),
      0,
      1
    );


  const R =
    clamp(
      Number(paramR?.value || 0),
      0,
      1
    );


  const G =
    clamp(
      Number(paramG?.value || 11),
      11,
      22
    );


  const I =
    clamp(
      Number(paramI?.value || 0),
      -4,
      4
    );


  const confirmations =
    Math.max(
      0,
      Number(
        paramConfirm?.value || 0
      )
    );


  const contradictions =
    Math.max(
      0,
      Number(
        paramContra?.value || 0
      )
    );


  const lenses =
    4;


  const Gnorm =
    (G - 11) /
    (22 - 11);


  const W =
    (
      (C * B) + R
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
      Math.abs(I) / 4
    );


  const M =
    W *
    (
      confirmations -
      contradictions
    ) /
    lenses;


  const V =
    Math.min(
      1,
      confirmations / 3
    );


  const F =
    M * V;


  return {
    C,
    B,
    R,
    G,
    Gnorm,
    I,
    confirmations,
    contradictions,
    lenses,
    W,
    M,
    V,
    F
  };

}


/* =========================================================
   PURIFICATION PROCESS UI
========================================================= */

runPurificationBtn?.addEventListener(
  "click",
  async () => {

    const title =
      storyTitle?.value.trim();

    const rawHtml =
      editorDocument?.innerHTML.trim();

    const rawText =
      editorDocument?.innerText.trim();


    if (!title) {

      showToast(
        "Give the Story a title first."
      );

      return;

    }


    if (!rawText) {

      showToast(
        "Write the field observation first."
      );

      return;

    }


    if (purificationProgress) {

      purificationProgress.classList.add(
        "active"
      );

    }


    if (purificationResult) {

      purificationResult.classList.remove(
        "active"
      );

    }


    if (publishStoryBtn) {

      publishStoryBtn.style.display =
        "none";

    }


    markProgress(
      1,
      "✓ Raw data captured"
    );


    await sleep(350);


    markProgress(
      2,
      "✓ Weighing"
    );


    await sleep(450);


    markProgress(
      3,
      "✓ Multi-Cognitive Pass"
    );


    await sleep(550);


    const result =
      calculateLegacyPurification();


    latestPurification =
      result;


    markProgress(
      4,
      "✓ Final Processing"
    );


    await sleep(450);


    if (resultScore) {

      resultScore.textContent =
        result.F.toFixed(3);

    }


    if (resultW) {

      resultW.textContent =
        result.W.toFixed(3);

    }


    if (resultM) {

      resultM.textContent =
        result.M.toFixed(3);

    }


    if (resultV) {

      resultV.textContent =
        result.V.toFixed(3);

    }


    if (resultConfirm) {

      resultConfirm.textContent =
        String(
          result.confirmations
        );

    }


    if (resultContra) {

      resultContra.textContent =
        String(
          result.contradictions
        );

    }


    if (purificationResult) {

      purificationResult.classList.add(
        "active"
      );

    }


    if (publishStoryBtn) {

      publishStoryBtn.style.display =
        "block";

    }


    showToast(
      "Legacy purification complete."
    );

  }
);


/* =========================================================
   PROGRESS
========================================================= */

function markProgress(
  number,
  text
) {

  const element =
    $(`progress-${number}`);


  if (!element) return;


  element.textContent =
    text;


  element.classList.add(
    "done"
  );

}


/* =========================================================
   PUBLISH STORY
========================================================= */

publishStoryBtn?.addEventListener(
  "click",
  async () => {

    const user =
      auth.currentUser;


    if (!user) {

      showToast(
        "You must be logged in."
      );

      return;

    }


    if (!latestPurification) {

      showToast(
        "Run purification first."
      );

      return;

    }


    const title =
      storyTitle?.value.trim();


    const bodyHtml =
      editorDocument?.innerHTML.trim();


    const bodyText =
      editorDocument?.innerText.trim();


    if (!title || !bodyText) {

      showToast(
        "The Story needs a title and content."
      );

      return;

    }


    const story = {

      title,

      summary:
        buildStorySummary(
          bodyText
        ),

      bodyHtml,

      bodyText,

      category:
        storyCategory?.value ||
        "Field Notes",

      location:
        storyLocation?.value.trim() ||
        "Nigeria",

      topic:
        storyTopic?.value.trim() ||
        "",

      observationDate:
        storyDate?.value ||
        "",

      purificationVersion:
        "Legacy Formula v1",

      purification: {
        ...latestPurification
      },

      status:
        "PURIFIED",

      authorId:
        user.uid,

      authorEmail:
        user.email ||
        null,

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


      showToast(
        "Story published to Legacy."
      );


      saveDraftLocally(
        reference.id,
        story
      );


      await loadStories();

      showStoriesPanel();

    }

    catch (error) {

      console.error(
        "Story publish error:",
        error
      );


      /*
        Fallback for a new project whose
        Firestore rules are not ready yet.
      */

      const localId =
        `local_${Date.now()}`;


      const localStory = {

        ...story,

        id:
          localId,

        createdAt:
          new Date().toISOString()

      };


      const existing =
        getLocalStories();


      existing.unshift(
        localStory
      );


      saveLocalStories(
        existing
      );


      showToast(
        "Firestore blocked the publish, so the Story was saved locally on this device."
      );


      await loadStories();

      showStoriesPanel();

    }

  }
);


/* =========================================================
   SAVE DRAFT
========================================================= */

saveDraftBtn?.addEventListener(
  "click",
  () => {

    const draft = {

      title:
        storyTitle?.value ||
        "",

      category:
        storyCategory?.value ||
        "",

      location:
        storyLocation?.value ||
        "",

      topic:
        storyTopic?.value ||
        "",

      date:
        storyDate?.value ||
        "",

      content:
        editorDocument?.innerHTML ||
        "",

      params: {

        C:
          paramC?.value,

        B:
          paramB?.value,

        R:
          paramR?.value,

        G:
          paramG?.value,

        I:
          paramI?.value,

        confirmations:
          paramConfirm?.value,

        contradictions:
          paramContra?.value

      },

      savedAt:
        new Date().toISOString()

    };


    const key =
      `legacy_draft_${auth.currentUser?.uid || "guest"}`;


    localStorage.setItem(
      key,
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
   LOAD DRAFT
========================================================= */

function loadDraft() {

  const key =
    `legacy_draft_${auth.currentUser?.uid || "guest"}`;


  const raw =
    localStorage.getItem(key);


  if (!raw) return;


  try {

    const draft =
      JSON.parse(raw);


    if (storyTitle)
      storyTitle.value =
        draft.title || "";


    if (storyCategory)
      storyCategory.value =
        draft.category ||
        "Commerce";


    if (storyLocation)
      storyLocation.value =
        draft.location || "";


    if (storyTopic)
      storyTopic.value =
        draft.topic || "";


    if (storyDate)
      storyDate.value =
        draft.date ||
        new Date()
          .toISOString()
          .slice(0,10);


    if (editorDocument)
      editorDocument.innerHTML =
        draft.content || "";


    if (draft.params) {

      if (paramC)
        paramC.value =
          draft.params.C || "0.8";

      if (paramB)
        paramB.value =
          draft.params.B || "0.8";

      if (paramR)
        paramR.value =
          draft.params.R || "0.5";

      if (paramG)
        paramG.value =
          draft.params.G || "16";

      if (paramI)
        paramI.value =
          draft.params.I || "0";

      if (paramConfirm)
        paramConfirm.value =
          draft.params.confirmations ||
          "1";

      if (paramContra)
        paramContra.value =
          draft.params.contradictions ||
          "0";

    }

  }

  catch (error) {

    console.warn(
      "Draft could not be loaded:",
      error
    );

  }

}


/* =========================================================
   STORY LOADING
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
        (doc) => ({

          id:
            doc.id,

          ...doc.data()

        })
      );

  }

  catch (error) {

    console.warn(
      "Firestore Stories unavailable:",
      error
    );

  }


  const localStories =
    getLocalStories();


  latestStories = [

    ...localStories,

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

  if (!container) return;


  if (!stories.length) {

    container.innerHTML = `

      <div
        class="feed-card"
        style="grid-column:1/-1;"
      >

        <h3>
          No Stories yet.
        </h3>

        <p
          style="
            color:var(--muted);
            margin-top:8px;
          "
        >
          Your first Legacy Story can start here.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    stories
      .map(
        story =>
          storyCardHtml(
            story
          )
      )
      .join("");

}


/* =========================================================
   STORY CARD
========================================================= */

function storyCardHtml(
  story
) {

  const category =
    escapeHtml(
      story.category ||
      "Field Notes"
    );


  const title =
    escapeHtml(
      story.title ||
      "Untitled Story"
    );


  const summary =
    escapeHtml(
      story.summary ||
      story.bodyText?.slice(0,280) ||
      "No summary available."
    );


  const location =
    escapeHtml(
      story.location ||
      "Nigeria"
    );


  let scoreLabel =
    "PURIFIED";


  if (
    typeof story.purifiedScore ===
    "number"
  ) {

    scoreLabel =
      `SCORE ${story.purifiedScore.toFixed(2)}`;

  }


  if (
    story.purification?.F !==
    undefined
  ) {

    scoreLabel =
      `SCORE ${Number(
        story.purification.F
      ).toFixed(2)}`;

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
          ● ${escapeHtml(scoreLabel)}
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
          Legacy Story
        </span>

      </div>

    </article>

  `;

}


/* =========================================================
   PUBLIC FILTER
========================================================= */

window.filterLandingStories =
  function(category) {

    const cards =
      document.querySelectorAll(
        "#landing-stories-grid .story-card"
      );


    cards.forEach(
      (card) => {

        if (
          category === "all"
        ) {

          card.style.display =
            "flex";

          return;

        }


        const storyCategory =
          card.dataset.storyCategory ||
          "";


        card.style.display =
          storyCategory.toLowerCase() ===
          category.toLowerCase()
            ? "flex"
            : "none";

      }
    );

  };


/* =========================================================
   LOCAL STORY FALLBACK
========================================================= */

function localStoriesKey() {

  return "legacy_local_stories";

}


function getLocalStories() {

  try {

    return JSON.parse(
      localStorage.getItem(
        localStoriesKey()
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
    localStoriesKey(),
    JSON.stringify(
      stories.slice(0,50)
    )
  );

}


function saveDraftLocally(
  id,
  story
) {

  const existing =
    getLocalStories();


  existing.unshift(
    {
      ...story,
      id
    }
  );


  saveLocalStories(
    existing
  );

}


/* =========================================================
   STORY SUMMARY
========================================================= */

function buildStorySummary(
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
      .slice(0,277)
      .trim() +
    "..."
  );

}


/* =========================================================
   HELPERS
========================================================= */

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


function escapeHtml(
  value
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    String(
      value ??
      ""
    );


  return div.innerHTML;

}


function friendlyAuthError(
  error
) {

  const code =
    error.code ||
    "";


  if (
    code.includes(
      "email-already-in-use"
    )
  ) {

    return (
      "That email is already registered. "
      +
      "Try signing in."
    );

  }


  if (
    code.includes(
      "invalid-credential"
    ) ||
    code.includes(
      "wrong-password"
    )
  ) {

    return (
      "Wrong email or password."
    );

  }


  if (
    code.includes(
      "user-not-found"
    )
  ) {

    return (
      "No account with that email."
    );

  }


  if (
    code.includes(
      "weak-password"
    )
  ) {

    return (
      "Password is too weak. "
      +
      "Use at least 6 characters."
    );

  }


  if (
    code.includes(
      "invalid-email"
    )
  ) {

    return (
      "That email address is not valid."
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


  return (
    error.message ||
    code ||
    "Something went wrong."
  );

}


/* =========================================================
   INITIALIZATION
========================================================= */

if (storyDate) {

  storyDate.value =
    new Date()
      .toISOString()
      .slice(0,10);

}


window.openWorkstation =
  openWorkstation;

window.showStoriesPanel =
  showStoriesPanel;
