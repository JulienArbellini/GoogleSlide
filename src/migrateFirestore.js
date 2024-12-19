const admin = require("firebase-admin");

// Configuration de Firebase Admin
const serviceAccount = require("./serviceAccountKey.json"); // Ton fichier clé JSON
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrateSlides() {
  try {
    const slidesSnapshot = await db.collection("slide").get();

    for (const slideDoc of slidesSnapshot.docs) {
      const slideData = slideDoc.data();
      const userId = "defaultUserId"; // Remplace par l'ID réel de l'utilisateur associé
      const presentationId = slideData.idPresentation;

      // Créer l'utilisateur s'il n'existe pas déjà
      const userRef = db.collection("users").doc(userId);
      await userRef.set({ name: "Utilisateur Exemple", email: "exemple@email.com" }, { merge: true });

      // Créer la présentation sous l'utilisateur
      const presentationRef = userRef.collection("presentations").doc(presentationId);
      await presentationRef.set({ title: "Titre de la présentation", createdAt: new Date() }, { merge: true });

      // Ajouter le slide dans la sous-collection slides
      const slideRef = presentationRef.collection("slides").doc(slideDoc.id);
      await slideRef.set({
        content: slideData.content,
        createdAt: new Date(),
      });

      console.log(`Slide ${slideDoc.id} migré avec succès !`);
    }

    console.log("Migration terminée !");
  } catch (error) {
    console.error("Erreur durant la migration :", error);
  }
}

migrateSlides();