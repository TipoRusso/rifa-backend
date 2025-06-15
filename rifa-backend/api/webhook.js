import mercadopago from 'mercadopago';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (!global._firebaseInitialized) {
  initializeApp({ credential: cert(serviceAccount) });
  global._firebaseInitialized = true;
}
const db = getFirestore();

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, data } = req.body;

  if (type === 'payment') {
    try {
      const payment = await mercadopago.payment.findById(data.id);
      const info = payment.body;

      if (info.status === 'approved') {
        const email = info.payer.email;
        const valor = info.transaction_amount;

        let qtd = 0;
        if (valor === 4.99) qtd = 100;
        else if (valor === 7.99) qtd = 200;
        else qtd = Math.floor(valor / 0.01);

        const numeros = [];
        for (let i = 0; i < qtd; i++) {
          numeros.push(Math.floor(Math.random() * 1000000));
        }

        await db.collection("compras").add({
          email,
          quantidade: qtd,
          valor,
          numeros,
          data: new Date().toISOString()
        });

        console.log(`Pagamento confirmado: ${email} | R$ ${valor} | ${qtd} números salvos`);
      }
    } catch (e) {
      console.error("Erro ao processar pagamento:", e.message);
    }
  }

  res.sendStatus(200);
}
