// @ts-nocheck
async function postActivities() {
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

  for (const activity of activities) {
    fetch(`https://checkout.theshrine.net/api/activity/code`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(activity),
      mode: "cors",
    }).then(async (response) => {
      const resJson = await response.json();

      if (resJson.code > 0) {
        console.log(resJson);

        const csrfToken = $('head > meta[name="csrf-token"]').attr("content");

        await fetch(
          `https://checkin.york.ac.uk/api/selfregistration/${resJson.id}/present`,
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
              code: resJson.code.toString().padStart(6, "0"),
            }),
            method: "POST",
            mode: "cors",
          },
        ).then(async (res) => {
          if (res.status == 200) {
            $(".selfregistration_status_undetermined").addClass("hidden");
            $(".selfregistration_status_present>div:last-child").text(
              "Checked Out!",
            );
            $(".selfregistration_status_present").removeClass("hidden");

            fetch(`https://checkout.theshrine.net/api/code/submit`, {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              method: "POST",
              body: JSON.stringify({
                code: resJson.code,
                accepted: true,
                activityId: resJson.activityId,
              }),
              mode: "cors",
            });
          }

          response = await res.json();
          console.log(response.message);
        });
      }
    });
  }
}

function onPageReady() {
  $("div.selfregistration_status_undetermined").addClass("hidden");
  $(".text-block").append(`
    <div class="selfregistration_status selfregistration_checkout">
      <button type="button" class="btn btn-success" data-targetstatus="checkout">
        <span class="font-icon font-icon-ok"></span>
        Present
      </button>
    </div>
    `);
}
