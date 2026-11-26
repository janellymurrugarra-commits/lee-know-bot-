// LEE KNOW - DARK VELVET ACADEMY
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')
const OWNER = '51989816820'
const ADMIN_GROUP = '51989816820@s.whatsapp.net'
const MAIN_GROUP = '120207xxx@g.us'
let conteo = {}
let grupoCerrado = false
async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('sesion')
  const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }) })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', (u) => {
    if (u.qr) console.log('ESCANEA ESTE QR')
    if (u.connection === 'open') console.log('Lee Know conectado')
  })
  sock.ev.on('group-participants.update', async (m) => {
    if (m.id !== MAIN_GROUP) return
    for (let p of m.participants) {
      if (m.action === 'add') {
        await sock.sendMessage(MAIN_GROUP, { text: `Bienvenida a Dark Velvet Academy 🖤\n\nHola @${p.split('@')[0]}, qué alegría tenerte aquí. Preséntate, dinos tu nombre y tu bias.\n\nLee Know te cuida 🖤`, mentions: [p] })
      }
      if (m.action === 'remove') {
        await sock.sendMessage(MAIN_GROUP, { text: `Se nos fue @${p.split('@')[0]}... Te vamos a extrañar 🖤 Gracias por haber sido parte de Dark Velvet.`, mentions: [p] })
      }
    }
  })
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return
    const from = msg.key.remoteJid
    const sender = msg.key.participant || msg.key.remoteJid
    const texto = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').toLowerCase()
    const textoOriginal = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    if (from !== MAIN_GROUP) return
    conteo[sender] = (conteo[sender] || 0) + 1
    let trato = 'normal'
    if (texto.includes('te quiero') || texto.includes('te amo') || texto.includes('gracias lee')) trato = 'bien'
    if (texto === 'hola' || texto === 'hi' || texto === 'ok') trato = 'reservado'
    if (texto.includes('tonto') || texto.includes('no sirves') || texto.includes('callate') || texto.includes('feo')) trato = 'mal'
    if (trato === 'mal') {
      await sock.sendMessage(MAIN_GROUP, { text: `Tranquila, entiendo que estés molesta 🖤 Aquí estoy si necesitas ayuda, no te voy a dejar sola.` })
      const alerta = `Alerta Dark Velvet\n@${sender.split('@')[0]} trató mal a Lee Know\nDijo: "${textoOriginal}"`
      await sock.sendMessage(ADMIN_GROUP, { text: alerta, mentions: [sender] })
      return
    }
    if (texto === '#close' && sender.includes(OWNER)) {
      grupoCerrado = true
      await sock.sendMessage(MAIN_GROUP, { text: `Grupo cerrado por el team 🖤 Solo el team puede hablar ahora. Descansen, mis niñas.` })
    }
    if (texto === '#open' && sender.includes(OWNER)) {
      grupoCerrado = false
      await sock.sendMessage(MAIN_GROUP, { text: `Grupo abierto ✨ Ya pueden hablar, las extrañé 🖤` })
    }
    if (texto === '#mismensajes') {
      await sock.sendMessage(MAIN_GROUP, { text: `@${sender.split('@')[0]} llevas ${conteo[sender]} mensajes 🖤 ¡Sigue así!`, mentions: [sender] })
    }
    if (texto === '#top' || texto === '#ranking') {
      let top = Object.entries(conteo).sort((a,b)=>b[1]-a[1]).slice(0,5)
      let txt = `TOP DARK VELVET 🖤\n\n`
      top.forEach((u,i)=> txt += `${i+1}. @${u[0].split('@')[0]} - ${u[1]} mensajes\n`)
      await sock.sendMessage(MAIN_GROUP, { text: txt, mentions: top.map(u=>u[0]) })
    }
    if (texto === '#reset' && sender.includes(OWNER)) {
      conteo = {}
      await sock.sendMessage(MAIN_GROUP, { text: `Ranking reseteado 🖤 Empezamos de cero, mis niñas.` })
    }
    if (texto.includes('lee know') || texto.includes('hola lee')) {
      if (trato === 'bien') await sock.sendMessage(MAIN_GROUP, { text: `Ayyy, tú siempre tan linda conmigo... gracias, de verdad me alegras el día ✨ ¿Cómo estás? ¿Hablamos un ratito?` })
      else if (trato === 'reservado') await sock.sendMessage(MAIN_GROUP, { text: `Hola, todo bien. Aquí estoy si necesitas algo.` })
      else await sock.sendMessage(MAIN_GROUP, { text: `Holaa 🖤 ¿Cómo estás? Aquí está Lee Know para ti.` })
    }
  })
}
start()
