

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleAuth } = require('google-auth-library');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// ─── CLOUD FUNCTION: Envoyer une notification ───
exports.sendNotification = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { title, body, type, targets, notifTarget, notifId } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }

    try {
      // Récupérer les tokens FCM des destinataires
      let tokens = [];

      if (notifTarget === 'all') {
        // Tous les utilisateurs
        const snap = await db.collection('fcm_tokens').get();
        tokens = snap.docs.map(d => d.data().token).filter(Boolean);
      } else {
        // Utilisateurs sélectionnés
        for (const uid of targets) {
          const doc = await db.collection('fcm_tokens').doc(uid).get();
          if (doc.exists && doc.data().token) {
            tokens.push(doc.data().token);
          }
        }
      }

      if (!tokens.length) {
        return res.status(200).json({ success: true, sent: 0, message: 'No tokens found' });
      }

      // Obtenir un access token OAuth2 (API V1 moderne)
      const auth = new GoogleAuth({
        credentials: {
          type: "service_account",
          project_id: "data-com-a94a8",
          private_key_id: "973bccf7f89a8cf770081af02ec0f5ff1adf24e7",
          private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCykPXvfVaB4ZEE\nY+Mv11RdmoBDkShM/7FGz6Nr7n4xFbQIWu4geRDndGOoxLX1/jN44bSz0r8ypXg9\naNMwlfDC5eF/pof2WANxcxuUIGQ2Ja97R4tKRM7seM15aciVH4aujas4Pe2P2Qc6\nCl9+JBR1uzPrBmWhGzKZd6XBHhH7Ex2sZPDGOcHwVVy3S0COMxKY6L2+/izLAOYb\n0RJ6yg7aBGd1Fu9zsTV6rlKoSdexvbPSHhvVyncM9hIRLswXPs17NBXnegjm3CeN\n2C1mP+v1Bqbt2cl2RU0uPQh/71ejLnRvBv8rnGSjeaNXpoZc2ZU8rZDYe0uGS1lI\ndFEQDs19AgMBAAECggEAAVhnLpaebi7iHlFEug/J0W5lexalH/CMIOfiH58QnK5q\nKZy6BtlY2Yfjpc/ITW5txsBCpFlJmGtc02dseEtJrTlT/ug5sRNMAKJo0HGkSfaI\nwTsh54GVPVN3ekJ0j1YHKcl5GdBkNbD+Xi/RuSsJrcdk+wxvVoRxYBojx6utgSnr\nKqh3aSPVPYoXcSMyUirLWblRIAL+O6eC/NBkfbde7VJaAN59PYTi8HNQDqruKNH+\n9wWM0d+zNFy9A/GmqUlyo2J9H6fERQ0m3Zua2s/LhwFp7tg2c8wLBRXknAApFNIU\nOG5DiNpG+r9Pyx822Ml+DhkApbDhtIesjFSe9zN4uwKBgQDoWVestOxcI6UvDUcu\nP0f7GV00jC7COU02CSi75QNSnQOR4ZtR3CABcr8OzQ1U+DFABfGy8lEgeG/aHk4z\nb6/YpH5tv5FuucaA1beNXZW7EF8DffgAA0brI3oN0EnXMJSAO4povuRNFNDzspKV\nwg8Oyp5xny18EZ9TUgrZz62jiwKBgQDEvh9m4CFSlxrkncj6lFEwMyjA1LAhgVGD\nohX0PHyWGQAlsxJb7x+SFaKvnemaU9jyR2uFDzDlOEYvCCYVfxYKZFh8gSBCg8kR\nrJ6GT/X0ZvbQCKwWkBBhxlF5kPvNOY/BaS6M5eNr3Ps1+NUSAxIbJnlw1UhFDXu5\nF6pY3NLUFwKBgQDMa0Y6uZa13dqHkfwNETnIDmG1SJwe3wEySE6hOPR6a4/negEH\nvU4fWBAF+pv/JLlX5aLnWE/N7Igj88PDd0DTrq1Y61ENhL7DPMRXyH1ibh3Z2asm\nf7uWRsksfBNrEt+kDj5Qt5nuwyCvN23F+kz7K4LI3k3LOUneqXDIfvH6zwKBgCLw\nvPTxQxm+2jjVyNavtod/3nH4k9svc0GUbJ+2ik3B3OPVHKKVIh84lm7n9Y/B6lqE\n0pSL8RwUVWqO4OyaaFiqH4jlCcymSPRJmtGxq7We/6BMmftb1Hz40olrdTyqR1yL\nCIhfX3dNhJO+QGD1iKanu5ONXUteLKXfjRJBDXQ7AoGAICO0j6eO+d16NOln5mO+\nAGDaXKaXJ02VYvn+U4kQwAIoDmY85MCjfkzWFCwrQ1qruoIACyGJg1pGC+FozWx/\nbJJnnpV0URYifeyKRrtAIK1GJ5c1+uPUNszvFYXeN0gU+qikbaDr3XhRkH+LKnEy\n1RuvR30MwZN20EjkfllQ51Q=\n-----END PRIVATE KEY-----\n",
          client_email: "firebase-adminsdk-fbsvc@data-com-a94a8.iam.gserviceaccount.com",
          client_id: "101594480167817977368",
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40data-com-a94a8.iam.gserviceaccount.com"
        },
        scopes: ['https://www.googleapis.com/auth/firebase.messaging']
      });

      const accessToken = await auth.getAccessToken();

      // Envoyer en lots de 500 (limite FCM)
      const BATCH_SIZE = 500;
      let totalSent = 0;
      let totalFailed = 0;

      for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
        const batch = tokens.slice(i, i + BATCH_SIZE);
        
        // FCM V1 API — envoi multicast
        const payload = {
          message: {
            notification: { title, body },
            data: {
              type: type || 'info',
              notifId: notifId || '',
              click_action: 'FLUTTER_NOTIFICATION_CLICK'
            },
            android: {
              notification: {
                channel_id: 'nexus_notifications',
                priority: type === 'urgent' ? 'HIGH' : 'DEFAULT',
                sound: 'default',
                icon: 'ic_notification'
              }
            },
            apns: {
              payload: {
                aps: { sound: 'default', badge: 1 }
              }
            },
            webpush: {
              notification: {
                icon: '/icon-192.png',
                badge: '/badge-72.png',
                vibrate: [200, 100, 200]
              },
              fcm_options: { link: '/dashboard.html' }
            }
          }
        };

        // Utiliser multicast pour plusieurs tokens
        const results = await Promise.allSettled(
          batch.map(token => {
            const msg = { ...payload.message, token };
            return admin.messaging().send(msg);
          })
        );

        results.forEach(r => {
          if (r.status === 'fulfilled') totalSent++;
          else totalFailed++;
        });
      }

      // Nettoyer les tokens invalides (optionnel - à activer en production)
      // await cleanupInvalidTokens();

      return res.status(200).json({
        success: true,
        sent: totalSent,
        failed: totalFailed,
        total: tokens.length
      });

    } catch (error) {
      console.error('FCM send error:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});

/**
 * ─── TRIGGER AUTOMATIQUE ───
 * Cette fonction se déclenche automatiquement quand une notification
 * est créée dans Firestore (par ex. lors d'une publication)
 */
exports.onNotificationCreated = functions.firestore
  .document('notifications/{notifId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data) return;

    const { title, body, type, targets, targetType } = data;

    try {
      let tokens = [];

      if (targetType === 'all') {
        const tokensSnap = await db.collection('fcm_tokens').get();
        tokens = tokensSnap.docs.map(d => d.data().token).filter(Boolean);
      } else {
        for (const uid of targets) {
          const doc = await db.collection('fcm_tokens').doc(uid).get();
          if (doc.exists && doc.data().token) tokens.push(doc.data().token);
        }
      }

      if (!tokens.length) return;

      const results = await Promise.allSettled(
        tokens.map(token => admin.messaging().send({
          token,
          notification: { title: title || 'NEXUS', body: body || '' },
          data: { type: type || 'info', notifId: context.params.notifId },
          webpush: {
            notification: { icon: '/icon-192.png', badge: '/badge-72.png' },
            fcm_options: { link: '/dashboard.html' }
          }
        }))
      );

      const sent = results.filter(r => r.status === 'fulfilled').length;
      console.log(`Notification sent to ${sent}/${tokens.length} devices`);

    } catch (error) {
      console.error('Auto-notification error:', error);
    }
  });
