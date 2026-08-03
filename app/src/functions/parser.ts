import { generateCourseId } from "./gen-schedule-helper";

export interface Course {
  id?: string;
  day: string;
  start: string;
  end: string;
  code: string;
  title: string;
  room: string;
  type: string;
  section: string;
  credits?: number;
  color?: string;
}

export function parseTime(timeStr: string): Date | null {
  if (!timeStr || !timeStr.includes(":")) return null;
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export function parseHtmlToJson(htmlContent: string): string {
  if (!htmlContent) return "[]";
  const parser = new DOMParser();
  const document = parser.parseFromString(htmlContent, "text/html");
  const coursesData: Course[] = [];

  const courseCards = document.querySelectorAll(".card");

  courseCards.forEach((card) => {
    const dayRaw =
      card.querySelector<HTMLElement>(
        "div[style='font-weight: 600; font-size: 10px;']"
      )?.innerText.trim() || "";

    const dayMap: Record<string, string> = {
      MON: "MON", TUE: "TUE", WED: "WED", THU: "THU", FRI: "FRI", SAT: "SAT", SUN: "SUN",
      "จ.": "MON", "อ.": "TUE", "พ.": "WED", "พฤ.": "THU", "ศ.": "FRI", "ส.": "SAT", "อา.": "SUN",
      MONDAY: "MON", TUESDAY: "TUE", WEDNESDAY: "WED", THURSDAY: "THU", FRIDAY: "FRI", SATURDAY: "SAT", SUNDAY: "SUN",
    };
    
    let day = "MON";
    const upperDay = dayRaw.toUpperCase();
    for (const [k, v] of Object.entries(dayMap)) {
      if (upperDay.includes(k)) {
        day = v;
        break;
      }
    }

    const timeRange =
      card.querySelector<HTMLElement>(
        "div[style='font-weight: 500; font-size: 18px;']"
      )?.innerText.trim() || "";

    let startTime = "09:00";
    let endTime = "10:00";

    if (timeRange.includes("-")) {
      const parts = timeRange.split("-").map((t) => t.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        startTime = parts[0];
        endTime = parts[1];
      }
    }

    const code =
      card.querySelector<HTMLElement>(
        "div[style='font-weight: 600; font-size: 12px;']"
      )?.innerText.trim() || "00000000";

    let title = "Untitled Course";
    const titleElement = card.querySelector<HTMLElement>("div.cut-word");
    if (titleElement) {
      title = titleElement.innerText.trim();
    }

    let room = "N/A";
    const roomLabelSpan = Array.from(card.querySelectorAll("span")).find(
      (el) => {
        const txt = el.textContent || "";
        return txt.includes("Room") || txt.includes("ห้อง");
      }
    );

    if (roomLabelSpan) {
      const parentDiv = roomLabelSpan.closest("div");
      if (parentDiv) {
        const fullRoomText = parentDiv.textContent?.trim() || "";
        room = fullRoomText.replace(/Room|ห้อง/g, "").trim() || "N/A";
      }
    }

    let courseType = "Lecture";
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
      )?.innerText.trim() || "1";

    // Try to parse credits if present in card text, else default to 3
    let credits = 3;
    const cardText = card.textContent || "";
    const creditMatch = cardText.match(/(\d+)\s*(?:credit|หน่วยกิต|cr)/i);
    if (creditMatch && creditMatch[1]) {
      credits = parseInt(creditMatch[1], 10) || 3;
    }

    coursesData.push({
      id: generateCourseId(),
      day,
      start: startTime,
      end: endTime,
      code,
      title,
      room,
      type: courseType,
      section,
      credits,
    });
  });

  return JSON.stringify(coursesData, null, 2);
}
