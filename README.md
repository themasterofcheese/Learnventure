# 🧙‍♂️ Learnventure: Chronicles of STEM

**Learnventure** is an interactive, 3D educational STEM RPG built with Three.js, HTML5, Vanilla CSS, and JavaScript. Players embark on a magical journey across 4 elemental biomes (Chemistry, Mathematics, Biology, and Physics), fight monsters, master STEM concepts, and unlock powerful battle spells.

---

## 🌟 Key Features

- **🎓 Ontario Curriculum Aligned**: Grade-specific questions tailored for Grades 4 through 10 (with dedicated Ontario School Curriculum banks for Grades 7 and 8).
- **🪄 Magic Training Academy**: 8 interactive STEM study topics with 10-question quizzes (80%+ score required to permanently unlock Stage 3 & 4 spells and status effects like Burn, Freeze, Poison, and Stun).
- **🗺️ Interactive 3D Overworld**: Built with Three.js featuring dynamic lighting, particle effects, 4 elemental biomes, and a medieval market plaza with NPC merchants.
- **⚔️ Turn-Based Battle System**: Strategic combat with element weaknesses, custom spell creation, pet rescue mechanics, and epic boss fights.
- **☁️ Cloud Deployable**: Ready for static hosting on Vercel or GitHub Pages.

---

## 🚀 Quick Start (Local Development)

To run **Learnventure** locally:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/Learnventure.git

# Navigate to project directory
cd Learnventure

# Start local web server
python3 -m http.server 8000
```

Open your browser and navigate to `http://localhost:8000`.

---

## 📜 Project Structure

```
├── index.html          # Main application HTML & screen structure
├── style.css           # Modern glassmorphic UI design tokens & layout
├── vercel.json         # Vercel static deployment configuration
├── assets/             # 3D textures, concept art, portraits & audio
└── src/
    ├── main.js         # Core application state & screen router
    ├── world3d.js      # Three.js 3D overworld rendering engine
    ├── battle.js       # Turn-based combat system & spell deck logic
    ├── training.js     # STEM Magic Academy study material & testing engine
    ├── questions.js    # Ontario Curriculum STEM database & procedural generators
    ├── audio.js        # Sound effects & Web Audio API synthesizer
    └── dashboard.js    # Player progression analytics & stat tracking
```

---

## 📄 License

MIT License — feel free to use, modify, and distribute for educational purposes!
