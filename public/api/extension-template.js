// @ts-nocheck

// References to "env.*" are replaced by the backend before being sent to the client
// when loaded from [PUBLIC_URL]/api/extension.js. This can be bypassed by loading
// from [PUBLIC_URL]/api/extension-template.js, in which case the script is useless
// since it doesn't have the url of the backend so probably don't do that :3

function getPageActivities() {
  var activities = [];

  for (const element of document.querySelectorAll(
    "section[data-activities-id]",
  )) {
    activities.push({ id: element.getAttribute("data-activities-id") });
    const rows = element.querySelectorAll("div>.row");
    for (const row of rows) {
      const divs = row.querySelectorAll("div");
      if (activities[activities.length - 1]) {
        activities[activities.length - 1][divs[0].innerText.toLowerCase()] =
          divs[1].innerText;
      }
    }
  }

  return activities;
}

async function getInternalActivity(input) {
  const response = await fetch(`${env.PUBLIC_URL}/api/activity/id-external`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(input),
    mode: "cors",
  });

  return response.json();
}

async function getHighestCode(activityId) {
  return fetch(`${env.PUBLIC_URL}/api/activity/code?activityId=${activityId}`, {
    headers: {
      Accept: "application/json",
    },
    method: "GET",
    mode: "cors",
  });
}

async function getAllCodes(activityId) {
  return fetch(`${env.PUBLIC_URL}/api/activity/${activityId}/codes`, {
    headers: {
      Accept: "application/json",
    },
    method: "GET",
    mode: "cors",
  });
}

async function getAciCodes(activityId) {
  const localId = $(
    `.selfregistration-checkout[data-activity-id="${activityId}"]`,
  )
    .closest("section[data-activities-id]:first")
    .attr("data-activities-id");

  const localActivity = getPageActivities().find(
    (activity) => activity.id == localId,
  );

  const aciCodesResponse = await fetch(
    "https://aci-api.ashhhleyyy.dev/api/codes/query?date=Monday%2026%20February&time=17%3A30%20-%2018%3A30&activity=Lecture%201&space=PZA%2F103%20Lecture%20Theatre",
    {
      credentials: "omit",
      headers: {
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.5",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
      },
      referrer: "https://aci-api.ashhhleyyy.dev/docs",
      method: "GET",
    },
  );

  const aciCodes = await aciCodesResponse.json();

  console.log(aciCodes);
}

async function getRejectCodes(activityId) {
  const localId = $(
    `.selfregistration-checkout[data-activity-id="${activityId}"]`,
  )
    .closest("section[data-activities-id]:first")
    .attr("data-activities-id");

  const localActivity = getPageActivities().find(
    (activity) => activity.id == 2816207,
    // (activity) => activity.id == localId,
  );

  const rejectCodesResponse = await fetch(
    "https://rejectdopamine.com/api/app/extension/codes",
    {
      credentials: "omit",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({
        date: moment().format("dddd DD MMMM"),
        time: localActivity.time,
        space: localActivity.space,
        activity: localActivity.activity,
      }),
      method: "POST",
    },
  );

  const aciCodes = await aciCodesResponse.json();

  console.log(aciCodes);
}

async function submitCode({ code, accepted, activityId }) {
  return fetch(`${env.PUBLIC_URL}/api/code/submit`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      code: code,
      accepted: accepted,
      activityId: activityId,
    }),
    mode: "cors",
  });
}

async function sendCheckinCode(code, id) {
  const csrfToken = $('head > meta[name="csrf-token"]').attr("content");

  return fetch(
    `https://checkin.york.ac.uk/api/selfregistration/${id}/present`,
    {
      credentials: "include",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-GB,en;q=0.5",
        "Content-Type": "application/json; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
      },
      referrer: "https://checkin.york.ac.uk/selfregistration",
      body: JSON.stringify({
        _token: csrfToken,
        code: code,
      }),
      method: "POST",
      mode: "cors",
    },
  );
}

async function codeSubmitted(code, localId, backendId, skipCodeFetch) {
  // console.log("Submitting code:");
  // console.log(code);
  // console.log(localId);
  // console.log(backendId);
  // console.log(skipCodeFetch);

  // return;

  let checkoutCode = code;

  if (code.toString().length !== 6 && !skipCodeFetch) {
    console.log("Too short, checkout time");
    console.log(activityId);
    const highestCode = await (await getHighestCode(backendId)).json();

    if (!highestCode.ok) {
      alertNotieInput("No codes available just yet");
      return;
    }

    checkoutCode = highestCode.code;
  }

  const checkinResponse = await sendCheckinCode(checkoutCode, localId);

  if (checkinResponse.status == 200) {
    checkedOut();

    submitCode({
      code: checkoutCode,
      accepted: true,
      activityId: backendId,
    });
  } else {
    submitCode({
      code: checkoutCode,
      accepted: false,
      activityId: backendId,
    });
  }
}

function checkedOut() {
  $(".selfregistration_checkout").addClass("hidden");
  $(".selfregistration_status_present>div:last-child").text("Checked Out!");
  $(".selfregistration_status_present").removeClass("hidden");
  $("#notie-input-no").trigger("click");

  hideCheckoutModal();
  clearCheckoutModal();
}

async function preInput(localId, backendId) {
  // Autofilled by the backend before being sent
  const AUTOFILL_ENABLED = env.AUTOFILL_ENABLED;

  if (AUTOFILL_ENABLED == true) {
    const highestCode = await (await getHighestCode(backendId)).json();

    console.log(highestCode);

    if (highestCode.ok && highestCode.score >= 0) {
      return codeSubmitted(highestCode.code, localId, backendId, true);
    }
  }

  const codes = await (await getAllCodes(backendId)).json();
  console.log("Autofill unavailable or disabled, opening input");
  if (codes.codes.length > 0) {
    showCheckoutModal();
    for (code of codes.codes) {
      $(".checkout-modal-content").append(`
        <div style="display: flex; padding-left: 16px; padding-right: 16px; align-items: center;${codes.codes.indexOf(code) % 2 == 1 ? " background-color: rgb(240, 240, 240);" : ""}">
          <hr>
          <p style="margin-top: 8px; margin-bottom: 8px;"><strong>Code:</strong> ${code.code} <br> <strong>Score:</strong> ${code.score}</p>
          <button type="button" style="margin-left: auto;" class="btn btn-success selfregistration-code-send" data-targetstatus="checkout" data-code="${code.code}">
            Submit
          </button>
        </div>
      `);
    }
    $(".selfregistration-code-send").on("click", (event) => {
      const code = event.target.dataset.code;
      return codeSubmitted(code, localId, backendId, true);
    });
  } else {
    $(".selfregistration-changestatus").trigger("click");
    alertNotieInput("No codes on the backend, please continue to checkin");
  }
}

// Should flash a message when submitting a code if you have entered a code that
// checkin won't accept, and the backend hasn't received any codes for that
// activity. ~~As of writing this it is untested.~~ Has been tested, works well.
function alertNotieInput(alertText = "An error occurred", time = 1500) {
  const text = $("#notie-input-text").text();
  $("#notie-input-inner").css("background-color", "red");
  $("#notie-input-text").text(alertText);
  setTimeout(() => {
    $("#notie-input-inner").css("background-color", "rgb(0, 168, 255)");
    $("#notie-input-text").text(text);
  }, time);
}

// Opens up the checkout modal
function showCheckoutModal() {
  $("#checkout-modal").css("display", "block");
}

function clearCheckoutModal() {
  $("#checkout-modal").find("div:not(:first)").remove();
}

function hideCheckoutModal() {
  $("#checkout-modal").css("display", "none");
}

// This function handles replacing the UI elements that checkin uses, allowing
// the script to intercept code submission by mimicking said elements
async function onPageReady() {
  const activities = await getPageActivities();

  $("div.selfregistration_status_undetermined").addClass("hidden");

  for (const activity of activities) {
    const internalActivity = await getInternalActivity(activity);

    const activityBlock = $(`section[data-activities-id="${activity.id}"]`);
    const textBlock = activityBlock.find(".text-block");

    if (textBlock.find("div.selfregistration_status_undetermined").length > 0) {
      textBlock.append(`
        <div class="selfregistration_status selfregistration_checkout">
          <button type="button" class="btn btn-success selfregistration-checkout" data-targetstatus="checkout" data-activity-id="${internalActivity.activityId}">
            <span class="font-icon font-icon-ok"></span>
            Checkout
          </button>
        </div>
      `);
    }
  }

  $(".page-content").append(`
    <div id="checkout-modal" class="checkout-modal">

      <div class="checkout-modal-content">
        <span class="checkout-modal-close">&times;</span>
        <p>Some text in the Modal..</p>
        <hr style="margin-top: 12.8px; margin-bottom: 19.2px;">
      </div>
    </div>
    <section data-activities-id="testing2">
      <button type="button" class="btn btn-success selfregistration-checkout" data-targetstatus="checkout" data-activity-id="clsw584dk001pu4l24dj2blj3">
        <span class="font-icon font-icon-ok"></span>
        No Codes Demo
      </button>
    </section>
    <section data-activities-id="testing">
      <button type="button" class="btn btn-success selfregistration-checkout" data-targetstatus="checkout" data-activity-id="clsw584df001ou4l2eeemohob">
        <span class="font-icon font-icon-ok"></span>
        One Code Demo
      </button>
    </section>
    <section data-activities-id="testing2">
      <button type="button" class="btn btn-success selfregistration-checkout" data-targetstatus="checkout" data-activity-id="clsw584b6001bu4l231nlmfct">
        <span class="font-icon font-icon-ok"></span>
        Two Codes Demo
      </button>
    </section>
  `);

  $(
    `<div id="checkout-input-div" style="box-sizing: border-box; height: 55px; width: 100%; display: block; cursor: default; background-color: rgb(255, 255, 255);">
      <input id="checkout-input-field" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="box-sizing: border-box; height: 55px; width: 100%; text-align: center; text-indent: 10px; padding-right: 10px; outline: 0px; border: 0px; font-family: inherit; font-size: 1rem;" type="number" placeholder="Check-In code ######">
    </div>`,
  ).insertAfter("#notie-input-div");
  $("#notie-input-div").addClass("hidden");

  // Get the modal
  var modal = document.getElementById("checkout-modal");
  var span = document.getElementsByClassName("checkout-modal-close")[0];

  span.onclick = function () {
    modal.style.display = "none";
    clearCheckoutModal();
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      clearCheckoutModal();
    }
  };

  // const activityId = await getInternalActivity(activities[0]);

  $(".selfregistration-checkout").on("click", (event) => {
    console.log("Checkout time");
    preInput(
      event.target.closest("section[data-activities-id]").dataset.activitiesId,
      event.target.dataset.activityId,
    );
  });

  $("#checkout-input-field").on("keypress", async (e) => {
    if (e.keyCode == 13) {
      codeSubmitted(
        $("#checkout-input-field").val(),
        activities[0].id,
        activityId.activityId,
      );
    }
  });

  $(
    `<div id="checkout-input-yes" style="float: left; height: 50px; line-height: 50px; width: 50%; cursor: pointer; font-weight: 600; background-color: rgb(70, 195, 95);">
      <span id="checkout-input-yes-text" style="color: rgb(255, 255, 255); font-size: 1rem;">Checkout</span>
    </div>`,
  ).insertAfter("#notie-input-yes");
  $("#notie-input-yes").addClass("hidden");

  $("#checkout-input-yes").on("click", () => {
    codeSubmitted(
      $("#checkout-input-field").val(),
      activities[0].id,
      activityId.activityId,
    );
  });
}

$(onPageReady);
