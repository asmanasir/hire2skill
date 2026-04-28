const NORWAY_MUNICIPALITIES_BY_COUNTY: Record<string, string[]> = {
  Agder: [
    'Arendal', 'Birkenes', 'Bygland', 'Bykle', 'Evje og Hornnes', 'Farsund', 'Flekkefjord', 'Froland', 'Gjerstad', 'Grimstad',
    'Haegebostad', 'Iveland', 'Kristiansand', 'Kvinesdal', 'Lillesand', 'Lindesnes', 'Lyngdal', 'Risor', 'Sirdal', 'Tvedestrand',
    'Valle', 'Vennesla', 'Aamli',
  ],
  Akershus: [
    'Asker', 'Baerum', 'Eidsvoll', 'Enebakk', 'Frogn', 'Gjerdrum', 'Hurdal', 'Lillestrom', 'Loerenskog', 'Nannestad', 'Nes',
    'Nesodden', 'Nittedal', 'Nordre Follo', 'Raelingen', 'Ullensaker', 'Vestby', 'Aas', 'Aurskog-Hoeland',
  ],
  Buskerud: [
    'Drammen', 'Flaa', 'Flesberg', 'Gol', 'Hemsedal', 'Hol', 'Hole', 'Kongsberg', 'Kroedsherrad', 'Lier', 'Modum', 'Nesbyen',
    'Nore og Uvdal', 'Ringerike', 'Rollag', 'Sigdal', 'Aal', 'Oevre Eiker',
  ],
  Finnmark: [
    'Alta', 'Baatsfjord', 'Berlevaag', 'Gamvik', 'Hammerfest', 'Hasvik', 'Karasjok', 'Kautokeino', 'Lebesby', 'Loppa', 'Maasoy',
    'Nesseby', 'Nordkapp', 'Porsanger', 'Soer-Varanger', 'Tana', 'Vadsoe', 'Vardoe',
  ],
  Innlandet: [
    'Alvdal', 'Dovre', 'Eidskog', 'Elverum', 'Engerdal', 'Etnedal', 'Folldal', 'Gausdal', 'Gjoevik', 'Gran', 'Grue', 'Hamar',
    'Kongsvinger', 'Lesja', 'Lillehammer', 'Lom', 'Loeten', 'Nord-Aurdal', 'Nordre Land', 'Nord-Fron', 'Nord-Odal', 'Os',
    'Rendalen', 'Ringebu', 'Ringsaker', 'Sel', 'Skjaak', 'Soendre Land', 'Soer-Aurdal', 'Soer-Fron', 'Soer-Odal', 'Stange',
    'Stor-Elvdal', 'Tolga', 'Trysil', 'Tynset', 'Vaaler', 'Vang', 'Vestre Slidre', 'Vestre Toten', 'Vaagaa', 'Ostre Toten',
    'Oeystre Slidre', 'Oeyer', 'Aamot', 'Aasnes',
  ],
  'Moere og Romsdal': [
    'Alesund', 'Aukra', 'Aure', 'Averoey', 'Fjord', 'Giske', 'Gjemnes', 'Haram', 'Hareid', 'Heroy', 'Hustadvika', 'Kristiansund',
    'Molde', 'Rauma', 'Rindal', 'Sande', 'Smola', 'Stranda', 'Sula', 'Sunndal', 'Surnadal', 'Sykkylven', 'Tingvoll', 'Ulstein',
    'Vanylven', 'Vestnes', 'Volda', 'Oersta',
  ],
  Nordland: [
    'Alstahaug', 'Andoy', 'Beiarn', 'Bindal', 'Bodo', 'Bronnoy', 'Boe (Nordland)', 'Donna', 'Evenes', 'Fauske', 'Flakstad',
    'Gildeskaal', 'Grane', 'Hadsel', 'Hamaroy', 'Hattfjelldal', 'Heroy', 'Leirfjord', 'Lodingen', 'Luroey', 'Meloy', 'Moskenes',
    'Nesna', 'Narvik', 'Rana', 'Rodoey', 'Rost', 'Saltdal', 'Sortland', 'Steigen', 'Sorfold', 'Sommna', 'Traena', 'Vefsn', 'Vega',
    'Vevelstad', 'Vestvaagoy', 'Vaagan', 'Vaeroy', 'Oksnes',
  ],
  Oslo: [
    'Oslo - Sentrum', 'Oslo - Grunerlokka', 'Oslo - Grønland', 'Oslo - Tøyen', 'Oslo - Gamlebyen', 'Oslo - Sørenga',
    'Oslo - Tjuvholmen', 'Oslo - Aker Brygge', 'Oslo - Bislett', 'Oslo - St. Hanshaugen', 'Oslo - Frogner',
    'Oslo - Majorstuen', 'Oslo - Skøyen', 'Oslo - Lysaker', 'Oslo - Bygdøy', 'Oslo - Ullern', 'Oslo - Røa',
    'Oslo - Vinderen', 'Oslo - Holmenkollen', 'Oslo - Sagene', 'Oslo - Sandaker', 'Oslo - Storo', 'Oslo - Nydalen',
    'Oslo - Sinsen', 'Oslo - Grefsen', 'Oslo - Kjelsås', 'Oslo - Tåsen', 'Oslo - Alna', 'Oslo - Furuset',
    'Oslo - Lindeberg', 'Oslo - Trosterud', 'Oslo - Haugerud', 'Oslo - Teisen', 'Oslo - Grorud', 'Oslo - Ammerud',
    'Oslo - Romsås', 'Oslo - Stovner', 'Oslo - Haugenstua', 'Oslo - Vestli', 'Oslo - Bjerke', 'Oslo - Helsfyr',
    'Oslo - Nordstrand', 'Oslo - Ljan', 'Oslo - Ekeberg', 'Oslo - Lambertseter', 'Oslo - Manglerud', 'Oslo - Ryen',
    'Oslo - Bryn', 'Oslo - Oppsal', 'Oslo - Bøler', 'Oslo - Holmlia', 'Oslo - Mortensrud',
  ],
  Rogaland: [
    'Bjerkreim', 'Bokn', 'Eigersund', 'Gjesdal', 'Haugesund', 'Haa', 'Hjelmeland', 'Karmoy', 'Klepp', 'Kvitsoy', 'Lund', 'Randaberg',
    'Sandnes', 'Sauda', 'Sokndal', 'Sola', 'Stavanger', 'Strand', 'Suldal', 'Time', 'Tysvaer', 'Utsira', 'Vindafjord',
  ],
  Telemark: [
    'Bamble', 'Boe (Telemark)', 'Drangedal', 'Fyresdal', 'Hjartdal', 'Kragero', 'Kviteseid', 'Midt-Telemark', 'Nissedal',
    'Nome', 'Notodden', 'Porsgrunn', 'Seljord', 'Siljan', 'Skien', 'Tinn', 'Tokke', 'Vinje',
  ],
  Troms: [
    'Balsfjord', 'Bardu', 'Dyrøy', 'Gratangen', 'Harstad', 'Ibestad', 'Karlsøy', 'Kvaefjord', 'Kvaenangen', 'Kafjord', 'Lavangen',
    'Loekangen', 'Malselv', 'Nordreisa', 'Salangen', 'Senja', 'Skjervoy', 'Soerreisa', 'Storfjord', 'Tjeldsund', 'Tromso',
  ],
  Trondelag: [
    'Flatanger', 'Frosta', 'Frøya', 'Grong', 'Heim', 'Hitra', 'Holtalen', 'Inderoy', 'Indre Fosen', 'Leka', 'Levanger', 'Lierne',
    'Malvik', 'Melhus', 'Meraker', 'Midtre Gauldal', 'Namsos', 'Namsskogan', 'Nærøysund', 'Oppdal', 'Orkland', 'Overhalla',
    'Rennebu', 'Rindal', 'Roros', 'Røyrvik', 'Selbu', 'Skaun', 'Snasa', 'Steinkjer', 'Stjordal', 'Trondheim', 'Tydal', 'Verdal',
    'Afjord', 'Osen', 'Orland',
  ],
  Vestfold: [
    'Faerder', 'Holmestrand', 'Horten', 'Larvik', 'Sandefjord', 'Toensberg',
  ],
  Vestland: [
    'Alver', 'Askvoll', 'Askoy', 'Aurland', 'Austevoll', 'Austrheim', 'Bergen', 'Bjoernafjorden', 'Bremanger', 'Bømlo', 'Eidfjord',
    'Etne', 'Fedje', 'Fitjar', 'Fjaler', 'Gloppen', 'Gulen', 'Hoyanger', 'Hyllestad', 'Kinn', 'Kvam', 'Kvinnherad', 'Laerdal',
    'Luster', 'Masfjorden', 'Modalen', 'Osteroy', 'Samnanger', 'Sogndal', 'Solund', 'Stad', 'Stord', 'Stryn', 'Sunnfjord',
    'Sveio', 'Tysnes', 'Ullensvang', 'Ulvik', 'Vaksdal', 'Vik', 'Voss', 'Ardal', 'Oeygarden',
  ],
  Ostfold: [
    'Aremark', 'Fredrikstad', 'Halden', 'Hvaler', 'Indre Ostfold', 'Marker', 'Moss', 'Raade', 'Rakkestad', 'Sarpsborg',
    'Skiptvet', 'Vaaler',
  ],
}

const COUNTY_NAME_NORMALIZATION: Record<string, string> = {
  Moere: 'Møre',
  og: 'og',
  Romsdal: 'Romsdal',
}

function toDisplayName(name: string) {
  return name
    .replace(/aa/g, 'å')
    .replace(/ae/g, 'æ')
    .replace(/oe/g, 'ø')
    .replace(/\b([A-Za-z])/g, (m) => m.toUpperCase())
}

function countyToDisplayName(name: string) {
  return name
    .split(' ')
    .map((part) => COUNTY_NAME_NORMALIZATION[part] ?? toDisplayName(part))
    .join(' ')
}

const counties = Object.keys(NORWAY_MUNICIPALITIES_BY_COUNTY).map(countyToDisplayName)

const municipalityCount: Record<string, number> = {}
for (const rawCounty of Object.keys(NORWAY_MUNICIPALITIES_BY_COUNTY)) {
  for (const rawMunicipality of NORWAY_MUNICIPALITIES_BY_COUNTY[rawCounty]) {
    const municipality = toDisplayName(rawMunicipality)
    municipalityCount[municipality] = (municipalityCount[municipality] ?? 0) + 1
  }
}

const municipalityOptions = Object.entries(NORWAY_MUNICIPALITIES_BY_COUNTY).flatMap(([rawCounty, rawMunicipalities]) => {
  const county = countyToDisplayName(rawCounty)
  return rawMunicipalities.map((rawMunicipality) => {
    const municipality = toDisplayName(rawMunicipality)
    if ((municipalityCount[municipality] ?? 0) > 1) {
      return `${municipality} (${county})`
    }
    return municipality
  })
})

export const NORWAY_COUNTY_OPTIONS = [...counties].sort((a, b) => a.localeCompare(b, 'nb'))

export const NORWAY_MUNICIPALITIES_BY_COUNTY_OPTIONS: Record<string, string[]> = Object.fromEntries(
  Object.entries(NORWAY_MUNICIPALITIES_BY_COUNTY).map(([rawCounty, rawMunicipalities]) => {
    const county = countyToDisplayName(rawCounty)
    const municipalities = rawMunicipalities
      .map((rawMunicipality) => {
        const municipality = toDisplayName(rawMunicipality)
        if ((municipalityCount[municipality] ?? 0) > 1) {
          return `${municipality} (${county})`
        }
        return municipality
      })
      .sort((a, b) => a.localeCompare(b, 'nb'))
    return [county, municipalities]
  }),
)

export const NORWAY_LOCATION_OPTIONS = [...new Set([...counties, ...municipalityOptions])].sort((a, b) =>
  a.localeCompare(b, 'nb'),
)

type SupportedLocale = 'no' | 'en' | 'da' | 'sv'

const COUNTY_LABELS_BY_LOCALE: Record<SupportedLocale, Partial<Record<string, string>>> = {
  no: {},
  da: {
    Innlandet: 'Indlandet',
    Trøndelag: 'Trondelag',
  },
  sv: {
    Innlandet: 'Inlandet',
    Trøndelag: 'Tröndelag',
  },
  en: {
    'Møre og Romsdal': 'More og Romsdal',
    Trøndelag: 'Trondelag',
    Østfold: 'Ostfold',
  },
}

function localizeCountyLabel(county: string, locale: SupportedLocale) {
  return COUNTY_LABELS_BY_LOCALE[locale][county] ?? county
}

function localizeMunicipalityLabel(option: string, locale: SupportedLocale) {
  const match = option.match(/^(.*)\s\((.*)\)$/)
  if (!match) return option
  const municipality = match[1]
  const county = match[2]
  return `${municipality} (${localizeCountyLabel(county, locale)})`
}

export function getLocalizedCountyOptions(locale: SupportedLocale) {
  return NORWAY_COUNTY_OPTIONS.map((county) => ({
    value: county,
    label: localizeCountyLabel(county, locale),
  }))
}

export function getLocalizedMunicipalityOptionsByCounty(locale: SupportedLocale) {
  return Object.fromEntries(
    Object.entries(NORWAY_MUNICIPALITIES_BY_COUNTY_OPTIONS).map(([county, municipalities]) => [
      county,
      municipalities.map((municipality) => ({
        value: municipality,
        label: localizeMunicipalityLabel(municipality, locale),
      })),
    ]),
  ) as Record<string, Array<{ value: string; label: string }>>
}

