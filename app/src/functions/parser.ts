// Type for course data
interface Course {
  day: string;
  start: string;
  end: string;
  code: string;
  title: string;
  room: string;
  type: string;
  section: string;
}

// Parse a datetime string into a datetime object
export function parseTime(timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export function parseHtmlToJson(htmlContent: string): string {
  const parser = new DOMParser();
  const document = parser.parseFromString(htmlContent, "text/html");
  const coursesData: Course[] = [];

  const courseCards = document.querySelectorAll(".card");

  courseCards.forEach((card) => {
    const day =
      card.querySelector<HTMLElement>(
        "div[style='font-weight: 600; font-size: 10px;']"
      )?.innerText.trim() || "N/A";

    const timeRange =
      card.querySelector<HTMLElement>(
        "div[style='font-weight: 500; font-size: 18px;']"
      )?.innerText.trim() || "N/A";

    let startTime = "N/A";
    let endTime = "N/A";

    if (timeRange.includes(" - ")) {
      const [startStr, endStr] = timeRange.split(" - ").map((t) => t.trim());
      startTime = startStr;
      endTime = endStr;

      try {
        let startDt = parseTime(startStr);
        let endDt = parseTime(endStr);

        // Handle crossing midnight
        if (endDt < startDt) {
          endDt.setDate(endDt.getDate() + 1);
        }

      } catch {
        // keep N/A if parsing fails
      }
    }

    // the course code is the first 'cut-word' element
    const code =
      card.querySelector<HTMLElement>(
        "div[style='font-weight: 600; font-size: 12px;']"
      )?.innerText.trim() || "N/A";

    let title = "N/A";
    const titleElement = card.querySelector<HTMLElement>("div.cut-word");
    if (titleElement) {
      title = titleElement.innerText.trim();
    }

    // Find room element by looking for 'Room' or 'ห้อง' within a span
    let room = "N/A";
    const roomLabelSpan = Array.from(card.querySelectorAll("span")).find(
      (el) => {
        const txt = el.textContent || "";
        return txt.includes("Room") || txt.includes("ห้อง");
      }
    );

    // Parse room number from room element
    if (roomLabelSpan) {
      const parentDiv = roomLabelSpan.closest("div");
      if (parentDiv) {
        const fullRoomText = parentDiv.textContent?.trim() || "";
        if (fullRoomText.includes("Room")) {
          room = fullRoomText.replace("Room", "").trim();
        } else if (fullRoomText.includes("ห้อง")) {
          room = fullRoomText.replace("ห้อง", "").trim();
        }
      }
    }

    // Determine type based on 'Lec', 'Lab', 'บรรยาย', or 'ปฏิบัติ'
    let courseType = "N/A";
    const typeText =
      card.querySelector<HTMLElement>(
        "span[class*='badge-blue'], span[class*='badge-orange']"
      )?.innerText.trim() || "";

    if (typeText === "บรรยาย" || typeText === "Lec") {
      courseType = "Lecture";
    } else if (typeText === "ปฏิบัติ" || typeText === "Lab") {
      courseType = "Laboratory";
    } else if (typeText) {
      courseType = typeText;
    }

    const section =
      card.querySelector<HTMLElement>(
        "span[style='color: rgb(10, 187, 135);']"
      )?.innerText.trim() || "N/A";

    coursesData.push({
      day,
      start: startTime,
      end: endTime,
      code,
      title,
      room,
      type: courseType,
      section,
    });
  });

  return JSON.stringify(coursesData, null, 2);
}
