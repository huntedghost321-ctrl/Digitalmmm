// Localization toggle — MVP scope: US/UK spelling + currency only (MVP item 6).

const US_TO_UK: [RegExp, string][] = [
  [/\bcolor(s|ed|ful|ing)?\b/g, "colour$1"],
  [/\bColor(s|ed|ful|ing)?\b/g, "Colour$1"],
  [/\bfavorite(s)?\b/g, "favourite$1"],
  [/\bFavorite(s)?\b/g, "Favourite$1"],
  [/\bbehavior(s|al)?\b/g, "behaviour$1"],
  [/\bBehavior(s|al)?\b/g, "Behaviour$1"],
  [/\borganiz(e|es|ed|ing|ation|ations|er|ers)\b/g, "organis$1"],
  [/\bOrganiz(e|es|ed|ing|ation|ations|er|ers)\b/g, "Organis$1"],
  [/\brealiz(e|es|ed|ing|ation)\b/g, "realis$1"],
  [/\bRealiz(e|es|ed|ing|ation)\b/g, "Realis$1"],
  [/\bprioritiz(e|es|ed|ing)\b/g, "prioritis$1"],
  [/\bPrioritiz(e|es|ed|ing)\b/g, "Prioritis$1"],
  [/\bpersonaliz(e|es|ed|ing|ation)\b/g, "personalis$1"],
  [/\bPersonaliz(e|es|ed|ing|ation)\b/g, "Personalis$1"],
  [/\bcustomiz(e|es|ed|ing|ation)\b/g, "customis$1"],
  [/\bCustomiz(e|es|ed|ing|ation)\b/g, "Customis$1"],
  [/\bcenter(s|ed|ing)?\b/g, "centre$1"],
  [/\bCenter(s|ed|ing)?\b/g, "Centre$1"],
  [/\btraveled\b/g, "travelled"],
  [/\btraveling\b/g, "travelling"],
  [/\btraveler(s)?\b/g, "traveller$1"],
  [/\bcanceled\b/g, "cancelled"],
  [/\bcanceling\b/g, "cancelling"],
  [/\bfulfill(s|ed|ing|ment)?\b/g, "fulfil$1"],
  [/\benrollment(s)?\b/g, "enrolment$1"],
  [/\bcatalog(s)?\b/g, "catalogue$1"],
  [/\bcheck(s)? off\b/g, "tick$1 off"],
  [/\blicense(s)?\b(?=\s+(is|are|to|for))/g, "licence$1"],
  [/\bprogram(s)?\b(?!\s*(code|ming|mer))/g, "programme$1"],
  [/\banalyz(e|es|ed|ing)\b/g, "analys$1"],
  [/\bAnalyz(e|es|ed|ing)\b/g, "Analys$1"],
  [/\$(\d[\d,]*(?:\.\d+)?)/g, "£$1"],
];

const UK_TO_US: [RegExp, string][] = [
  [/\bcolour(s|ed|ful|ing)?\b/g, "color$1"],
  [/\bColour(s|ed|ful|ing)?\b/g, "Color$1"],
  [/\bfavourite(s)?\b/g, "favorite$1"],
  [/\bFavourite(s)?\b/g, "Favorite$1"],
  [/\bbehaviour(s|al)?\b/g, "behavior$1"],
  [/\bBehaviour(s|al)?\b/g, "Behavior$1"],
  [/\borganis(e|es|ed|ing|ation|ations|er|ers)\b/g, "organiz$1"],
  [/\bOrganis(e|es|ed|ing|ation|ations|er|ers)\b/g, "Organiz$1"],
  [/\brealis(e|es|ed|ing|ation)\b/g, "realiz$1"],
  [/\bRealis(e|es|ed|ing|ation)\b/g, "Realiz$1"],
  [/\bprioritis(e|es|ed|ing)\b/g, "prioritiz$1"],
  [/\bPrioritis(e|es|ed|ing)\b/g, "Prioritiz$1"],
  [/\bpersonalis(e|es|ed|ing|ation)\b/g, "personaliz$1"],
  [/\bPersonalis(e|es|ed|ing|ation)\b/g, "Personaliz$1"],
  [/\bcustomis(e|es|ed|ing|ation)\b/g, "customiz$1"],
  [/\bCustomis(e|es|ed|ing|ation)\b/g, "Customiz$1"],
  [/\bcentre(s|d)?\b/g, "center$1"],
  [/\bCentre(s|d)?\b/g, "Center$1"],
  [/\btravelled\b/g, "traveled"],
  [/\btravelling\b/g, "traveling"],
  [/\btraveller(s)?\b/g, "traveler$1"],
  [/\bcancelled\b/g, "canceled"],
  [/\bcancelling\b/g, "canceling"],
  [/\bfulfil(s|led|ling|ment)?\b/g, "fulfill$1"],
  [/\benrolment(s)?\b/g, "enrollment$1"],
  [/\bcatalogue(s)?\b/g, "catalog$1"],
  [/\bticked off\b/g, "checked off"],
  [/\blicence(s)?\b/g, "license$1"],
  [/\bprogramme(s)?\b/g, "program$1"],
  [/\banalys(e|es|ed|ing)\b(?!is)/g, "analyz$1"],
  [/\bAnalys(e|es|ed|ing)\b(?!is)/g, "Analyz$1"],
  [/£(\d[\d,]*(?:\.\d+)?)/g, "$$$1"],
];

export function localizeContent(content: string, target: "US" | "UK"): string {
  const rules = target === "UK" ? US_TO_UK : UK_TO_US;
  let out = content;
  for (const [pattern, replacement] of rules) {
    out = out.replace(pattern, replacement);
  }
  return out;
}
