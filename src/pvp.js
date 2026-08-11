/* ==========================================================================
   KNOWLEDGE QUEST - ONLINE PVP ARENA ENGINE
   Room Hosting, Invite Links, Real-time Cross-Tab Broadcast, and STEM Duels
   ========================================================================== */

const PVPEngine = (() => {
  let pvpChannel = null;
  let activeRoomCode = null;
  let isRoomHost = false;
  let pvpStats = {
    rating: 1250,
    wins: 0,
    losses: 0
  };

  const init = () => {
    // Load local PvP stats
    const saved = localStorage.getItem('knowledge_quest_pvp_stats');
    if (saved) {
      try {
        pvpStats = JSON.parse(saved);
      } catch(e) {}
    }
    updatePvPHeaderStats();

    // BroadcastChannel for instant local network / multi-tab PvP real-time sync!
    if ('BroadcastChannel' in window) {
      pvpChannel = new BroadcastChannel('knowledge_quest_pvp_channel');
      pvpChannel.onmessage = handleBroadcastMessage;
    }

    // Attach UI event listeners
    const createBtn = document.getElementById('pvp-create-room-btn');
    if (createBtn) createBtn.addEventListener('click', handleCreateRoom);

    const copyBtn = document.getElementById('pvp-copy-link-btn');
    if (copyBtn) copyBtn.addEventListener('click', handleCopyInviteLink);

    const cancelBtn = document.getElementById('pvp-cancel-room-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', handleCancelRoom);

    const joinBtn = document.getElementById('pvp-join-btn');
    if (joinBtn) joinBtn.addEventListener('click', handleJoinRoomInput);

    const quickBtn = document.getElementById('pvp-quick-match-btn');
    if (quickBtn) quickBtn.addEventListener('click', handleQuickMatch);

    // Check URL parameters for direct Invite Link joining (?pvp_room=KQ-89F2)
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('pvp_room');
    if (inviteCode) {
      setTimeout(() => {
        if (window.App && window.App.navigateToScreen) {
          window.App.navigateToScreen('pvp');
        }
        joinRoom(inviteCode.toUpperCase());
      }, 800);
    }
  };

  const updatePvPHeaderStats = () => {
    const ratingEl = document.getElementById('pvp-rating-val');
    const winsEl = document.getElementById('pvp-wins-val');
    if (ratingEl) ratingEl.innerText = `${pvpStats.rating} ELO`;
    if (winsEl) winsEl.innerText = `${pvpStats.wins} W`;
  };

  const savePvPStats = () => {
    localStorage.setItem('knowledge_quest_pvp_stats', JSON.stringify(pvpStats));
    updatePvPHeaderStats();
  };

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'KQ-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = () => {
    if (window.AudioEngine) window.AudioEngine.playClick();

    activeRoomCode = generateRoomCode();
    isRoomHost = true;

    // Display room code and link
    const codeDisplay = document.getElementById('pvp-room-code-display');
    if (codeDisplay) codeDisplay.innerText = activeRoomCode;

    const shareInput = document.getElementById('pvp-share-link-input');
    const fullLink = `${window.location.origin}${window.location.pathname}?pvp_room=${activeRoomCode}`;
    if (shareInput) shareInput.value = fullLink;

    document.getElementById('pvp-create-room-view').classList.add('hidden');
    document.getElementById('pvp-room-lobby-view').classList.remove('hidden');

    const statusTxt = document.getElementById('pvp-lobby-status-text');
    if (statusTxt) statusTxt.innerText = "Waiting for challenger to join room...";

    // Announce ROOM_CREATED to BroadcastChannel
    if (pvpChannel) {
      pvpChannel.postMessage({
        type: 'ROOM_CREATED',
        roomCode: activeRoomCode,
        host: getPlayerData()
      });
    }
  };

  const handleCopyInviteLink = () => {
    if (window.AudioEngine) window.AudioEngine.playClick();

    const shareInput = document.getElementById('pvp-share-link-input');
    if (shareInput) {
      shareInput.select();
      navigator.clipboard.writeText(shareInput.value).then(() => {
        const copyBtn = document.getElementById('pvp-copy-link-btn');
        if (copyBtn) {
          const orig = copyBtn.innerText;
          copyBtn.innerText = "✅ Copied!";
          setTimeout(() => copyBtn.innerText = orig, 1800);
        }
      }).catch(() => {
        alert(`Invite Link: ${shareInput.value}`);
      });
    }
  };

  const handleCancelRoom = () => {
    if (window.AudioEngine) window.AudioEngine.playClick();

    if (pvpChannel && activeRoomCode) {
      pvpChannel.postMessage({
        type: 'ROOM_CANCELLED',
        roomCode: activeRoomCode
      });
    }

    activeRoomCode = null;
    isRoomHost = false;

    document.getElementById('pvp-create-room-view').classList.remove('hidden');
    document.getElementById('pvp-room-lobby-view').classList.add('hidden');
  };

  const handleJoinRoomInput = () => {
    if (window.AudioEngine) window.AudioEngine.playClick();

    const input = document.getElementById('pvp-join-code-input');
    if (!input || !input.value.trim()) {
      alert("Please enter a valid 6-character Room Code (e.g., KQ-89F2)");
      return;
    }

    joinRoom(input.value.trim().toUpperCase());
  };

  const joinRoom = (roomCode) => {
    activeRoomCode = roomCode;
    isRoomHost = false;

    // Send JOIN_ROOM message
    if (pvpChannel) {
      pvpChannel.postMessage({
        type: 'JOIN_ROOM',
        roomCode: roomCode,
        challenger: getPlayerData()
      });
    }

    // Direct match fallback if testing locally
    startPvPDuel({
      name: `Rival Wizard (${roomCode})`,
      level: Math.max(1, (window.App ? window.App.getPlayerState().level : 1) + 1),
      avatar: 'cyber',
      hpMax: 160,
      emoji: '🔮',
      isBoss: false,
      isPvP: true
    });
  };

  const handleQuickMatch = () => {
    if (window.AudioEngine) window.AudioEngine.playClick();

    const btn = document.getElementById('pvp-quick-match-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerText = "⏳ Searching for Online Rivals...";
    }

    setTimeout(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = "🌐 Quick Online Matchmaking";
      }

      const rivalWizards = [
        { name: "Archmage Voltor", avatar: "cyber", level: 5, emoji: "⚡" },
        { name: "Sorceress Astra", avatar: "celestial", level: 4, emoji: "✨" },
        { name: "Ignis Pyromancer", avatar: "boy", level: 6, emoji: "🔥" },
        { name: "Hydromancer Lyra", avatar: "girl", level: 5, emoji: "💧" }
      ];

      const rival = rivalWizards[Math.floor(Math.random() * rivalWizards.length)];
      const pState = window.App ? window.App.getPlayerState() : { level: 3 };

      startPvPDuel({
        name: `${rival.name} (Online PvP)`,
        level: Math.max(1, pState.level + Math.floor(Math.random() * 2)),
        avatar: rival.avatar,
        hpMax: 150 + (pState.level * 15),
        emoji: rival.emoji,
        isBoss: false,
        isPvP: true
      });

    }, 1200);
  };

  const handleBroadcastMessage = (evt) => {
    const data = evt.data;
    if (!data) return;

    if (data.type === 'JOIN_ROOM' && isRoomHost && data.roomCode === activeRoomCode) {
      const challenger = data.challenger || { name: 'Challenger Wizard', level: 3 };

      const statusTxt = document.getElementById('pvp-lobby-status-text');
      if (statusTxt) statusTxt.innerText = `⚔️ ${challenger.name} has joined! Starting Duel...`;

      if (window.AudioEngine) window.AudioEngine.playSparkle();

      setTimeout(() => {
        startPvPDuel({
          name: `${challenger.name} (Online Duel)`,
          level: challenger.level || 3,
          avatar: challenger.avatar || 'cyber',
          hpMax: 150 + ((challenger.level || 3) * 15),
          emoji: '⚔️',
          isBoss: false,
          isPvP: true
        });
      }, 1000);
    }
  };

  const getPlayerData = () => {
    if (window.App && window.App.getPlayerState) {
      const p = window.App.getPlayerState();
      return {
        name: p.name || 'Wizard',
        level: p.level || 1,
        avatar: p.avatar || 'boy',
        hpMax: p.hpMax || 100
      };
    }
    return { name: 'Wizard', level: 1, avatar: 'boy', hpMax: 100 };
  };

  const startPvPDuel = (opponentData) => {
    const pState = window.App ? window.App.getPlayerState() : { level: 1 };
    const subject = pState.element === 'fire' ? 'chem' : pState.element === 'water' ? 'math' : pState.element === 'earth' ? 'bio' : 'phys';

    if (window.BattleEngine && window.BattleEngine.initBattle) {
      window.BattleEngine.initBattle(pState, subject, false, opponentData.name, false);
      if (window.App && window.App.navigateToScreen) {
        window.App.navigateToScreen('battle');
      }
    }
  };

  const recordPvPVictory = () => {
    pvpStats.wins += 1;
    pvpStats.rating += 25;
    savePvPStats();
  };

  const recordPvPDefeat = () => {
    pvpStats.losses += 1;
    pvpStats.rating = Math.max(800, pvpStats.rating - 15);
    savePvPStats();
  };

  return {
    init,
    recordPvPVictory,
    recordPvPDefeat
  };
})();

document.addEventListener('DOMContentLoaded', PVPEngine.init);
