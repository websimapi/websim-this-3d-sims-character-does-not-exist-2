const { useState, useEffect, useMemo } = React;
const { createRoot } = ReactDOM;

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [creator, setCreator] = useState(null);

  const simsWebSocket = useMemo(() => new SimsWebSocket(), []);
  const characterGenerator = useMemo(() => new CharacterGenerator(), []);
  const imageGenerator = useMemo(() => new ImageGenerator(), []);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const user = await simsWebSocket.getCurrentUser();
        const creatorData = await simsWebSocket.getCreator();
        setCurrentUser(user);
        setCreator(creatorData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Failed to initialize user:", error);
      }
    };

    initializeUser();
  }, []);

  return (
    <div className="app-container">
      <Header creator={creator} />
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}>
          Create Character
        </button>
        <button 
          className={`tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}>
          Character Gallery
        </button>
      </div>
      
      {activeTab === 'create' ? (
        <CharacterCreator 
          characterGenerator={characterGenerator}
          imageGenerator={imageGenerator}
          simsWebSocket={simsWebSocket}
          currentUser={currentUser}
        />
      ) : (
        <CharacterGallery 
          simsWebSocket={simsWebSocket}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

// Header Component
function Header({ creator }) {
  return (
    <div className="header">
      <h1>This 3D Sims Character Does Not Exist</h1>
      <p>Create and discover unique AI-generated Sims characters</p>
      {creator && <p className="creator-note">Created by: {creator.username}</p>}
    </div>
  );
}

// Character Creator Component
function CharacterCreator({ characterGenerator, imageGenerator, simsWebSocket, currentUser }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    personality: '',
    occupation: '',
    interests: '',
    style: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedCharacter, setGeneratedCharacter] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // First, generate the character description
      const characterResult = await characterGenerator.generateCharacterDescription(formData);
      
      // Then, generate clothing description based on character description
      const clothingPrompt = await characterGenerator.generateClothingPrompt(characterResult.description);
      
      // Finally, generate the image based on the clothing description
      const imageUrl = await imageGenerator.generateCharacterImage(clothingPrompt);
      
      // Create the character object
      const newCharacter = {
        name: characterResult.name,
        description: characterResult.description,
        clothingPrompt: clothingPrompt,
        imageUrl: imageUrl,
        createdBy: currentUser ? currentUser.username : 'Anonymous',
        timestamp: new Date().toISOString()
      };
      
      // Save to database
      await simsWebSocket.createCharacter(newCharacter);
      
      // Update state
      setGeneratedCharacter(newCharacter);
      
      // Reset form 
      setFormData({
        name: '',
        age: '',
        personality: '',
        occupation: '',
        interests: '',
        style: ''
      });
    } catch (err) {
      console.error("Error generating character:", err);
      setError("Failed to generate character. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator-container">
      <div className="form-container">
        <h2>Generate Your Sims Character</h2>
        <p>Fill in as many or as few details as you want - the AI will fill in the rest!</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name (optional):</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Leave blank for random name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="age">Age (optional):</label>
            <input 
              type="text" 
              id="age" 
              name="age" 
              value={formData.age} 
              onChange={handleChange} 
              placeholder="Child, Teen, Young Adult, Adult, Elder, etc."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="personality">Personality Traits (optional):</label>
            <input 
              type="text" 
              id="personality" 
              name="personality" 
              value={formData.personality} 
              onChange={handleChange} 
              placeholder="Creative, Gloomy, Outgoing, etc."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="occupation">Occupation (optional):</label>
            <input 
              type="text" 
              id="occupation" 
              name="occupation" 
              value={formData.occupation} 
              onChange={handleChange} 
              placeholder="Doctor, Astronaut, Artist, etc."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="interests">Interests & Hobbies (optional):</label>
            <input 
              type="text" 
              id="interests" 
              name="interests" 
              value={formData.interests} 
              onChange={handleChange} 
              placeholder="Cooking, Gaming, Fitness, etc."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="style">Fashion Style (optional):</label>
            <input 
              type="text" 
              id="style" 
              name="style" 
              value={formData.style} 
              onChange={handleChange} 
              placeholder="Casual, Formal, Gothic, Sporty, etc."
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Character'}
          </button>
        </form>
        
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Creating your Sim, please wait...</p>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        {generatedCharacter && !loading && (
          <div className="generated-preview">
            <h3>Successfully Created!</h3>
            <p>Your character has been added to the gallery.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Character Gallery Component
function CharacterGallery({ simsWebSocket }) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const characterList = await simsWebSocket.getCharacters();
        setCharacters(characterList);
      } catch (error) {
        console.error("Error fetching characters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();

    // Subscribe to updates
    const unsubscribe = simsWebSocket.subscribeToCharacters((updatedCharacters) => {
      setCharacters(updatedCharacters);
    });

    return () => {
      unsubscribe();
    };
  }, [simsWebSocket]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading characters...</p>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="empty-gallery">
        <h2>No characters yet!</h2>
        <p>Be the first to create a unique Sims character.</p>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <h2>Character Gallery</h2>
      <p>Browse AI-generated Sims characters created by the community</p>
      
      <div className="gallery">
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  );
}

// Character Card Component
function CharacterCard({ character }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="character-card">
      <img 
        src={character.imageUrl} 
        alt={character.name} 
        className="character-image"
      />
      <div className="character-details">
        <h3 className="character-name">{character.name}</h3>
        <div className={`character-description ${expanded ? 'expanded' : ''}`}>
          {expanded 
            ? character.description 
            : `${character.description.substring(0, 100)}...`}
        </div>
        <button className="expand-button" onClick={toggleExpand}>
          {expanded ? 'Show Less' : 'Show More'}
        </button>
        <div className="character-metadata">
          <span>By: {character.createdBy || character.username}</span>
          <span>Created: {formatDate(character.timestamp || character.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

// Render the App
const root = createRoot(document.getElementById('app'));
root.render(<App />);

