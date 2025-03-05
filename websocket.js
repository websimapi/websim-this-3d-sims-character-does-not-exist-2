// Initialize WebsimSocket for multiplayer functionality
class SimsWebSocket {
  constructor() {
    this.room = new WebsimSocket();
    this.initializeConnection();
  }

  initializeConnection() {
    this.room.onmessage = (event) => {
      const data = event.data;
      switch (data.type) {
        case "connected":
          console.log(`Client ${data.clientId} (${data.username}) connected`);
          break;
        case "disconnected":
          console.log(`Client ${data.clientId} (${data.username}) disconnected`);
          break;
        default:
          console.log("Received event:", data);
      }
    };
  }

  async getCharacters() {
    return this.room.collection('simsCharacter').getList();
  }

  async createCharacter(characterData) {
    return await this.room.collection('simsCharacter').create(characterData);
  }

  subscribeToCharacters(callback) {
    return this.room.collection('simsCharacter').subscribe(callback);
  }

  async getCurrentUser() {
    return {
      id: this.room.party.client.id,
      username: this.room.party.client.username
    };
  }

  async getCreator() {
    return await window.websim.getCreatedBy();
  }
}

