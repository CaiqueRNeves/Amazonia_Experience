import db from '../config/database.js';

class EmergencyPhrase {
  // Buscar frases por idioma
  static async findByLanguage(language) {
    const phrases = await db('emergency_phrases')
      .where({ language })
      .select('*')
      .orderBy('category');
    
    // Se não houver frases para o idioma solicitado, retornar frases em inglês
    if (phrases.length === 0 && language !== 'en-US') {
      return this.findByLanguage('en-US');
    }
    
    // Agrupar frases por categoria
    const phrasesByCategory = {};
    phrases.forEach(phrase => {
      if (!phrasesByCategory[phrase.category]) {
        phrasesByCategory[phrase.category] = [];
      }
      
      phrasesByCategory[phrase.category].push({
        id: phrase.id,
        text: phrase.phrase_text,
        translation: phrase.translation_text,
        pronunciation: phrase.pronunciation_guide
      });
    });
    
    return phrasesByCategory;
  }
}

export default EmergencyPhrase;