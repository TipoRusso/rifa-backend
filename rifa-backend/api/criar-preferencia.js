import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { title, unit_price } = req.body;

  if (!title || !unit_price) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    const preference = await mercadopago.preferences.create({
      items: [{
        title,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: parseFloat(unit_price)
      }],
      back_urls: {
        success: 'https://6000-firebase-studio-1749902886286.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev/sucesso',
        failure: 'https://6000-firebase-studio-1749902886286.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev/falha',
        pending: 'https://6000-firebase-studio-1749902886286.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev/pendente'
      },
      auto_return: 'approved',
      notification_url: 'https://rifa-backend.vercel.app/api/webhook'
    });

    return res.status(200).json({ init_point: preference.body.init_point });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
