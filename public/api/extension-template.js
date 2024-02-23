// @ts-nocheck

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

async function getIdFromActivity(input) {
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

async function codeSubmitted(code) {
  const activities = await getPageActivities();
  const activityId = await getIdFromActivity(activities[0]);

  let checkoutCode = code;

  if (code.toString().length !== 6) {
    console.log("Too short, checkout time");
    console.log(activityId);
    const highestCode = await (
      await getHighestCode(activityId.activityId)
    ).json();

    if (!highestCode.ok) {
      alertNotieInput("No codes available just yet");
      return;
    }

    checkoutCode = highestCode.code;
  }

  console.log("Using checkin code");

  const checkinResponse = await sendCheckinCode(checkoutCode, activities[0].id);

  if (checkinResponse.status == 200) {
    $(".selfregistration_checkout").addClass("hidden");
    $(".selfregistration_status_present>div:last-child").text("Checked Out!");
    $(".selfregistration_status_present").removeClass("hidden");
    $("#notie-input-no").trigger("click");

    submitCode({
      code: checkoutCode,
      accepted: true,
      activityId: activityId.activityId,
    });
  } else {
    submitCode({
      code: checkoutCode,
      accepted: false,
      activityId: activityId.activityId,
    });
  }
}

// Should flash a message when submitting a code if you have entered a code that
// checkin won't accept, and the backend hasn't received any codes for that
// activity. As of writing this it is untested
function alertNotieInput(alertText = "An error occurred") {
  const text = $("#notie-input-text").text();
  $("#notie-input-inner").css("background-color", "red");
  $("#notie-input-text").text(alertText);
  setTimeout(() => {
    $("#notie-input-inner").css("background-color", "rgb(0, 168, 255)");
    $("#notie-input-text").text(text);
  }, 1500);
}

// This function handles replacing the UI elements that checkin uses, allowing
// the script to intercept code submission by mimicking said elements
function onPageReady() {
  $("div.selfregistration_status_undetermined").addClass("hidden");
  $(".text-block").append(`
    <div class="selfregistration_status selfregistration_checkout">
      <button type="button" class="btn btn-success selfregistration-checkout" data-targetstatus="checkout">
        <span class="font-icon font-icon-ok"></span>
        Checkout
      </button>
    </div>
    `);

  $(".selfregistration-checkout").on("click", () => {
    console.log("Checkout time");
    $(".selfregistration-changestatus").trigger("click");
  });

  $(
    `<div id="checkout-input-div" style="box-sizing: border-box; height: 55px; width: 100%; display: block; cursor: default; background-color: rgb(255, 255, 255);">
      <input id="checkout-input-field" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="box-sizing: border-box; height: 55px; width: 100%; text-align: center; text-indent: 10px; padding-right: 10px; outline: 0px; border: 0px; font-family: inherit; font-size: 1rem;" type="number" placeholder="Check-In code ######">
    </div>`,
  ).insertAfter("#notie-input-div");
  $("#notie-input-div").addClass("hidden");

  $("#checkout-input-field").on("keypress", async (e) => {
    if (e.keyCode == 13) {
      codeSubmitted($("#checkout-input-field").val());
    }
  });

  $(
    `<div id="checkout-input-yes" style="float: left; height: 50px; line-height: 50px; width: 50%; cursor: pointer; font-weight: 600; background-color: rgb(70, 195, 95);">
      <span id="checkout-input-yes-text" style="color: rgb(255, 255, 255); font-size: 1rem;">Checkout</span>
    </div>`,
  ).insertAfter("#notie-input-yes");
  $("#notie-input-yes").addClass("hidden");

  $("#checkout-input-yes").on("click", () => {
    codeSubmitted($("#checkout-input-field").val());
  });
}

$(onPageReady);
