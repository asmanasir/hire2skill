/**
 * Norwegian Bokmål strings for web push (primary market: Norway).
 * Email copy in /api/notify remains English until templates are localized.
 */

export function pushNewBooking(posterName: string): { title: string; body: string } {
  const who = posterName.trim() || 'Noen'
  return {
    title: `Ny forespørsel fra ${who}`,
    body: 'Trykk for å se og svare.',
  }
}

export function pushBookingAccepted(helperName: string): { title: string; body: string } {
  const who = helperName.trim() || 'Hjelperen'
  return {
    title: `${who} godtok forespørselen`,
    body: 'Åpne chatten for å fortsette.',
  }
}

export function pushBookingDeclined(helperName: string): { title: string; body: string } {
  const who = helperName.trim() || 'Hjelperen'
  return {
    title: `${who} avslo forespørselen`,
    body: 'Finn hjelpere og send en ny forespørsel.',
  }
}

export function pushNewMessage(senderName: string, previewPlain: string): { title: string; body: string } {
  const who = senderName.trim() || 'Noen'
  const snippet = previewPlain.trim()
  return {
    title: `${who} sendte en melding`,
    body: snippet ? snippet.slice(0, 100) : 'Trykk for å svare i chatten.',
  }
}
