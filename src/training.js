/* KNOWLEDGE QUEST — SPELL TRAINING & UNLOCK ENGINE */
const TrainingEngine = (() => {
  const STORAGE_KEY = 'knowledge_quest_unlocked_spells';
  const getUnlocked = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch(e) { return {}; } };
  const isUnlocked = (id) => !!getUnlocked()[id];
  const unlockSpell = (id) => { const s = getUnlocked(); s[id] = true; localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); };

  const topics = {
    chem_combustion: {
      spellId:'ignis_inferno', spellName:'Ignis Inferno', spellEmoji:'\uD83D\uDD25', spellElement:'fire', spellStatus:'\uD83D\uDD25 Burn',
      topicTitle:'Combustion & Chemical Reactions', topicColor:'#ef4444',
      pages:[
        {heading:'\uD83D\uDD25 Page 1: Exothermic & Endothermic Reactions',content:'<p><strong style="color:#ef4444">Exothermic Reactions</strong> release energy (heat/light) into surroundings. Temperature increases.<br>Examples: combustion, explosions, hand warmers.</p><p><strong style="color:#38bdf8">Endothermic Reactions</strong> absorb energy from surroundings. Temperature decreases.<br>Examples: photosynthesis, melting ice, cold packs.</p><div class="study-formula-box">Exo = EXIT (energy exits out) | Endo = ENTER (energy enters in)</div>'},
        {heading:'\uD83D\uDD2C Page 2: Physical vs Chemical Changes',content:'<p><strong style="color:#f97316">Chemical Change</strong> \u2014 forms NEW substances. Signs: temp change, gas produced, colour change, light.<br>Examples: iron rusting, wood burning, cooking an egg.</p><p><strong style="color:#22c55e">Physical Change</strong> \u2014 same chemical substance, different shape/state.<br>Examples: ice melting, dissolving sugar in water, cutting paper.</p><div class="study-formula-box">Can you get the original substance back exactly? Yes \u2192 Physical. No \u2192 Chemical.</div>'},
        {heading:'\u2697\uFE0F Page 3: Combustion Reactions',content:'<p><strong>Combustion</strong> = rapid reaction between fuel and oxygen (O\u2082) producing heat and light.</p><div class="study-formula-box">Complete Combustion: Fuel + O\u2082 \u2192 CO\u2082 + H\u2082O + Energy</div><p>Example \u2014 Burning Methane: CH\u2084 + 2O\u2082 \u2192 CO\u2082 + 2H\u2082O</p><p>Incomplete combustion (low O\u2082) \u2192 produces poisonous CO (carbon monoxide) + soot instead of CO\u2082.</p><p><strong>Activation Energy</strong> \u2014 minimum energy needed to start a reaction (e.g., striking a match).</p>'}
      ],
      questions:[
        {q:"Wood burning in a campfire releases heat and light. What type of reaction?",choices:["Endothermic \u2014 absorbs heat","Exothermic \u2014 releases heat","Physical change only","Nuclear reaction"],correct:1,exp:"Combustion (burning) is exothermic \u2014 it releases heat and light energy into surroundings."},
        {q:"Which of the following is an endothermic process?",choices:["Iron rusting","Wood burning","Ice melting (absorbs heat from surroundings)","Explosions"],correct:2,exp:"Ice melting absorbs thermal energy from surroundings \u2014 endothermic. Surroundings feel cooler."},
        {q:"Iron slowly turning to rust is an example of a:",choices:["Physical change","Chemical change","State change","Mixture"],correct:1,exp:"Rusting forms a new substance (iron oxide Fe\u2082O\u2083) \u2014 it is a chemical change. Cannot be reversed."},
        {q:"What are the products of COMPLETE combustion of a hydrocarbon?",choices:["CO + H\u2082","CO\u2082 + H\u2082O + Energy","Ash + smoke only","O\u2082 + N\u2082"],correct:1,exp:"Complete combustion of any hydrocarbon produces CO\u2082, H\u2082O, and energy."},
        {q:"A reaction causes its container to become ice-cold. What type of reaction is this?",choices:["Exothermic","Endothermic","Combustion","Neutralisation"],correct:1,exp:"Container cooling = reaction absorbs heat from surroundings = endothermic."},
        {q:"Which of these is a PHYSICAL change?",choices:["Burning a candle","Dissolving salt in water","Baking bread","Iron rusting"],correct:1,exp:"Dissolving salt is physical \u2014 no new substance forms. Salt can be recovered by evaporation."},
        {q:"The minimum energy needed to start a chemical reaction is called:",choices:["Thermal energy","Activation energy","Potential energy","Chemical energy"],correct:1,exp:"Activation energy is the barrier that must be overcome to start a reaction."},
        {q:"Incomplete combustion produces which harmful gas?",choices:["CO\u2082","H\u2082O vapour","CO (carbon monoxide)","O\u2082"],correct:2,exp:"Incomplete combustion (not enough oxygen) produces poisonous CO instead of CO\u2082."},
        {q:"Photosynthesis is endothermic because plants:",choices:["Release CO\u2082 gas","Absorb light energy from the sun to make glucose","Burn glucose for energy","Produce heat"],correct:1,exp:"Plants absorb solar energy to convert CO\u2082 + H\u2082O into glucose \u2014 energy is taken IN."},
        {q:"In CH\u2084 + 2O\u2082 \u2192 CO\u2082 + 2H\u2082O, what is the fuel?",choices:["Oxygen (O\u2082)","Carbon dioxide (CO\u2082)","Methane (CH\u2084)","Water (H\u2082O)"],correct:2,exp:"CH\u2084 is methane \u2014 the fuel. It reacts with oxygen in combustion to produce CO\u2082 and water."}
      ]
    },
    chem_acids: {
      spellId:'plasma_burst', spellName:'Plasma Burst', spellEmoji:'\uD83D\uDC8E', spellElement:'fire', spellStatus:null,
      topicTitle:'Acids, Bases & pH Scale', topicColor:'#f97316',
      pages:[
        {heading:'\uD83E\uDDEA Page 1: The pH Scale',content:'<p>The <strong>pH scale</strong> measures acidity/alkalinity from <strong>0 to 14</strong>.</p><div class="study-formula-box">pH 0\u20136 = Acidic | pH 7 = Neutral | pH 8\u201314 = Alkaline (Basic)</div><p>\uD83C\uDF4B Acids: vinegar (pH\u22483), lemon juice (pH\u22482), stomach acid (pH\u22481\u20132)<br>\uD83D\uDCA7 Neutral: pure water (pH 7)<br>\uD83E\uDDFC Alkalis: baking soda (pH\u22488), bleach (pH\u224812), oven cleaner (pH\u224813)</p>'},
        {heading:'\u2697\uFE0F Page 2: Properties of Acids & Bases',content:'<p><strong style="color:#ef4444">Acids</strong> \u2014 sour taste, turn blue litmus RED, pH &lt; 7, react with metals to produce H\u2082 gas, corrosive.<br>Examples: HCl, H\u2082SO\u2084, citric acid</p><p><strong style="color:#3b82f6">Bases/Alkalis</strong> \u2014 slippery feel, turn red litmus BLUE, pH &gt; 7.<br>Examples: NaOH, ammonia (NH\u2083), CaCO\u2083</p><div class="study-formula-box">\uD83D\uDD34 Acid \u2192 RED litmus | \uD83D\uDD35 Base \u2192 BLUE litmus</div>'},
        {heading:'\u2696\uFE0F Page 3: Neutralisation Reactions',content:'<p><strong>Neutralisation</strong> \u2014 acid + base react to form a salt and water (pH moves toward 7).</p><div class="study-formula-box">Acid + Base \u2192 Salt + Water</div><p>Example: HCl + NaOH \u2192 NaCl + H\u2082O</p><p>Real-world uses: indigestion tablets (base neutralises stomach acid), toothpaste (neutralises mouth acids), treating acidic soil with lime (calcium oxide).</p>'}
      ],
      questions:[
        {q:"A solution has a pH of 2. What does this tell you?",choices:["Strongly basic","Neutral","Strongly acidic","Slightly alkaline"],correct:2,exp:"pH 2 is well below 7 \u2014 strongly acidic."},
        {q:"What is the pH of pure neutral water?",choices:["0","5","7","14"],correct:2,exp:"Pure water has a pH of exactly 7 \u2014 perfectly neutral."},
        {q:"Which indicator colour change shows a solution is acidic?",choices:["Red litmus turns blue","Blue litmus turns red","Blue litmus stays blue","Red litmus stays red"],correct:1,exp:"Acids turn BLUE litmus paper RED."},
        {q:"Lemon juice has a pH of about 2. This means it is:",choices:["Strongly basic","Neutral","Weakly acidic","Strongly acidic"],correct:3,exp:"pH 2 is near the bottom of the scale \u2014 strongly acidic."},
        {q:"Which of these is a BASE?",choices:["Vinegar (pH 3)","Lemon juice (pH 2)","Baking soda (pH 8)","Cola (pH 3.5)"],correct:2,exp:"Baking soda has pH\u22488 \u2014 a mild base."},
        {q:"When an acid reacts with a base, the products are:",choices:["Two new acids","Salt + Water","Gas + Metal","CO\u2082 + H\u2082"],correct:1,exp:"Acid + Base \u2192 Salt + Water. This is neutralisation."},
        {q:"Indigestion tablets relieve heartburn by:",choices:["Increasing stomach acid","Neutralising excess stomach acid","Absorbing food faster","Lowering pH further"],correct:1,exp:"The base in the tablet neutralises excess stomach acid, raising pH to a comfortable level."},
        {q:"What gas is produced when a metal reacts with an acid?",choices:["Oxygen","Carbon dioxide","Hydrogen","Nitrogen"],correct:2,exp:"Metal + Acid \u2192 Salt + Hydrogen gas (H\u2082). Test with a lit splint \u2014 it 'pops'."},
        {q:"Which end of the pH scale is MOST acidic?",choices:["pH 14","pH 7","pH 0","pH 10"],correct:2,exp:"pH 0 is the most acidic end. pH 14 is the most alkaline."},
        {q:"Farmers add lime (a base) to acidic soil. Why?",choices:["To make soil more acidic","To neutralise excess acidity for better growing conditions","To add minerals","To make plants grow faster by acidifying"],correct:1,exp:"Lime neutralises excess soil acidity (raises pH toward neutral), improving growing conditions."}
      ]
    },
    phys_thermo: {
      spellId:'glacial_glaze', spellName:'Glacial Glaze', spellEmoji:'\u2744\uFE0F', spellElement:'water', spellStatus:'\u2744\uFE0F Freeze',
      topicTitle:'Thermodynamics & States of Matter', topicColor:'#38bdf8',
      pages:[
        {heading:'\uD83E\uDDCA Page 1: States of Matter',content:'<div class="study-formula-box">Solid \u2192 Fixed shape & volume | Liquid \u2192 Fixed volume, takes shape of container | Gas \u2192 No fixed shape or volume</div><p>\uD83E\uDDF1 <strong>Solid:</strong> particles tightly packed, vibrate only, very low KE.<br>\uD83D\uDCA7 <strong>Liquid:</strong> particles close but free to move, medium KE.<br>\uD83D\uDCA8 <strong>Gas:</strong> particles far apart, move freely, high KE, highly compressible.</p>'},
        {heading:'\uD83C\uDF21\uFE0F Page 2: Changes of State & Latent Heat',content:'<p>Latent heat is absorbed or released during state changes WITHOUT temperature changing.</p><div class="study-formula-box">Melting (solid\u2192liquid) | Boiling (liquid\u2192gas) \u2192 ABSORB heat<br>Freezing (liquid\u2192solid) | Condensation (gas\u2192liquid) \u2192 RELEASE heat</div><p>Water: melts at 0\u00B0C, boils at 100\u00B0C. Temperature stays flat during state changes \u2014 latent heat breaks/forms bonds.</p>'},
        {heading:'\uD83D\uDD25 Page 3: Heat Transfer Methods',content:'<p>Heat always flows from HOT to COLD. Three methods:</p><p>\uD83D\uDD34 <strong>Conduction</strong> \u2014 through solids by particle vibration. Metals conduct well; wood/plastic insulate.<br>\uD83D\uDD35 <strong>Convection</strong> \u2014 in fluids; hot fluid rises, cool sinks (convection currents).<br>\uD83D\uDFE1 <strong>Radiation</strong> \u2014 EM waves; works in vacuum. How the Sun heats Earth.</p><div class="study-formula-box">Dark matt = best absorber & emitter | Shiny light = best reflector</div>'}
      ],
      questions:[
        {q:"Which state of matter has a FIXED volume but takes the shape of its container?",choices:["Solid","Liquid","Gas","Plasma"],correct:1,exp:"Liquids have fixed volume but flow to fill their container."},
        {q:"When water boils at 100\u00B0C, what change of state occurs?",choices:["Solid to liquid","Liquid to gas (vaporisation)","Gas to liquid","Solid to gas"],correct:1,exp:"Boiling is vaporisation \u2014 liquid water converts to water vapour (gas)."},
        {q:"Why does temperature stay constant during melting even though heat is added?",choices:["Thermometer is broken","Heat is used as latent heat to change state, not raise temperature","Melting absorbs no heat","Heat converts to light"],correct:1,exp:"During a state change, latent heat breaks particle bonds \u2014 temperature stays flat until complete."},
        {q:"Heat transfer through a solid by particle vibration is called:",choices:["Convection","Radiation","Conduction","Evaporation"],correct:2,exp:"Conduction transfers heat through solids. Metals are good conductors."},
        {q:"Which state of matter has the MOST kinetic energy?",choices:["Solid","Liquid","Gas","All equal"],correct:2,exp:"Gas particles move fastest and most freely \u2014 highest kinetic energy."},
        {q:"Hot air rising and cold air sinking creating air currents is an example of:",choices:["Conduction","Convection","Radiation","Condensation"],correct:1,exp:"Convection currents: hot fluid rises (less dense), cool sinks (denser)."},
        {q:"At what temperature does water freeze?",choices:["-10\u00B0C","0\u00B0C","4\u00B0C","100\u00B0C"],correct:1,exp:"Water freezes at 0\u00B0C (32\u00B0F)."},
        {q:"The Sun heats Earth across empty space. What heat transfer method is this?",choices:["Conduction","Convection","Radiation","Compression"],correct:2,exp:"Radiation travels as EM waves through vacuum \u2014 no medium needed."},
        {q:"Which surface type absorbs radiation BEST?",choices:["Shiny silver","White smooth","Dark matt (dull black)","Transparent"],correct:2,exp:"Dark, matt surfaces are the best absorbers and emitters of thermal radiation."},
        {q:"Condensation (gas \u2192 liquid) involves:",choices:["Absorbing heat","Releasing heat to surroundings","No heat change","Increasing particle speed"],correct:1,exp:"Condensation releases latent heat \u2014 why steam burns are so dangerous."}
      ]
    },
    math_algebra: {
      spellId:'hydro_nova', spellName:'Hydro Nova', spellEmoji:'\uD83C\uDF0A', spellElement:'water', spellStatus:null,
      topicTitle:'Algebra & Quadratic Equations', topicColor:'#3b82f6',
      pages:[
        {heading:'\uD83D\uDCD0 Page 1: Linear Equations',content:'<p>Do the same operation to BOTH sides to isolate x.</p><div class="study-formula-box">Example: 2x + 5 = 13 \u2192 2x = 8 \u2192 x = 4 \u2713</div><p>Expand brackets first: 3(x + 2) = 21 \u2192 3x + 6 = 21 \u2192 3x = 15 \u2192 x = 5 \u2713</p>'},
        {heading:'\uD83D\uDCCA Page 2: Straight Line Graphs',content:'<p>Equation of a straight line: <strong>y = mx + c</strong></p><div class="study-formula-box">m = slope (gradient) | c = y-intercept<br>Slope formula: m = (y\u2082 \u2212 y\u2081) \u00F7 (x\u2082 \u2212 x\u2081)</div><p>Example: Points (0,3) and (2,7): m = (7\u22123)\u00F7(2\u22120) = 2, y-intercept = 3 \u2192 y = 2x + 3</p>'},
        {heading:'\uD83D\uDD22 Page 3: Quadratic Equations',content:'<p>Form: <strong>ax\u00B2 + bx + c = 0</strong></p><div class="study-formula-box">Factoring: x\u00B2 \u2212 5x + 6 = 0 \u2192 (x\u22122)(x\u22123)=0 \u2192 x=2 or x=3<br>Formula: x = [\u2212b \u00B1 \u221A(b\u00B2\u22124ac)] \u00F7 2a</div><p>Discriminant (b\u00B2\u22124ac): &gt;0 = 2 solutions | =0 = 1 solution | &lt;0 = no real solutions</p>'}
      ],
      questions:[
        {q:"Solve for x: 3x + 9 = 24",choices:["x = 3","x = 5","x = 7","x = 11"],correct:1,exp:"3x = 24 \u2212 9 = 15 \u2192 x = 5."},
        {q:"In y = mx + c, what does 'm' represent?",choices:["y-intercept","x-intercept","Slope (gradient)","Area under line"],correct:2,exp:"m is the slope (gradient) \u2014 how steep the line is."},
        {q:"What is the slope of y = \u22124x + 7?",choices:["7","4","\u22124","\u22127"],correct:2,exp:"In y = mx + c, the slope m = \u22124."},
        {q:"Solve: x\u00B2 \u2212 7x + 12 = 0",choices:["x = 3 or x = 4","x = 2 or x = 6","x = \u22123 or x = \u22124","x = 1 or x = 12"],correct:0,exp:"Factors of 12 that add to \u22127: \u22123 and \u22124 \u2192 (x\u22123)(x\u22124)=0 \u2192 x=3 or x=4."},
        {q:"What is the y-intercept of y = 3x \u2212 5?",choices:["3","\u22125","5","0"],correct:1,exp:"c = \u22125 is the y-intercept. The line crosses the y-axis at \u22125."},
        {q:"Expand: 4(2x \u2212 3)",choices:["8x \u2212 3","8x \u2212 12","6x \u2212 12","8x + 12"],correct:1,exp:"4\u00D72x=8x and 4\u00D7(\u22123)=\u221212. Result: 8x \u2212 12."},
        {q:"Discriminant of x\u00B2 + 4x + 4 = 0 is 0. How many solutions?",choices:["One repeated solution","Two distinct solutions","No real solutions","Infinite solutions"],correct:0,exp:"b\u00B2\u22124ac = 16\u221216 = 0 \u2192 exactly one repeated solution."},
        {q:"Solve for x: 5x \u2212 3 = 2x + 9",choices:["x = 2","x = 3","x = 4","x = 6"],correct:2,exp:"5x \u2212 2x = 9 + 3 \u2192 3x = 12 \u2192 x = 4."},
        {q:"A line passes through (1, 5) and (3, 11). What is its slope?",choices:["2","3","4","6"],correct:1,exp:"m = (11\u22125)\u00F7(3\u22121) = 6\u00F72 = 3."},
        {q:"Which of the following is a quadratic equation?",choices:["y = 3x + 2","y = x\u00B2 \u2212 4x + 4","y = 5","y = 1/x"],correct:1,exp:"A quadratic has x\u00B2 as highest power. Only y = x\u00B2 \u2212 4x + 4 qualifies."}
      ]
    },
    bio_cells: {
      spellId:'venomous_vortex', spellName:'Venomous Vortex', spellEmoji:'\uD83C\uDF3F', spellElement:'earth', spellStatus:'\uD83D\uDC0D Poison',
      topicTitle:'Cell Biology & Organelles', topicColor:'#22c55e',
      pages:[
        {heading:'\uD83D\uDD2C Page 1: Cell Theory & Types',content:'<p><strong>Cell Theory:</strong> All living things made of cells. Cell is basic unit of life. All cells come from pre-existing cells.</p><p>\uD83E\uDDA0 <strong>Prokaryotic</strong> \u2014 no membrane-bound nucleus (e.g. bacteria).<br>\uD83E\uDDEC <strong>Eukaryotic</strong> \u2014 true membrane-bound nucleus (e.g. plant/animal cells).</p>'},
        {heading:'\u2699\uFE0F Page 2: Key Organelles',content:'<div class="study-formula-box">\uD83E\uDDE0 Nucleus \u2014 stores DNA (control centre)<br>\u26A1 Mitochondria \u2014 produces ATP energy (powerhouse)<br>\uD83C\uDF3F Chloroplast \u2014 plant only; photosynthesis<br>\uD83C\uDFED Ribosome \u2014 makes proteins<br>\uD83D\uDCE6 Vacuole \u2014 storage (large central vacuole in plants)<br>\uD83D\uDEE1\uFE0F Cell membrane \u2014 controls entry/exit<br>\uD83E\uDDF1 Cell wall \u2014 plant only; rigid outer layer</div>'},
        {heading:'\uD83C\uDF31 Page 3: Photosynthesis & Respiration',content:'<p><strong>Photosynthesis</strong> (chloroplasts, plant cells only):</p><div class="study-formula-box">6CO\u2082 + 6H\u2082O + Light \u2192 C\u2086H\u2081\u2082O\u2086 (glucose) + 6O\u2082</div><p><strong>Cellular Respiration</strong> (mitochondria, ALL cells):</p><div class="study-formula-box">C\u2086H\u2081\u2082O\u2086 + 6O\u2082 \u2192 6CO\u2082 + 6H\u2082O + ATP (energy)</div><p>Photosynthesis stores energy. Respiration releases it. They are opposite processes.</p>'}
      ],
      questions:[
        {q:"Which organelle is known as the 'powerhouse of the cell'?",choices:["Ribosome","Nucleus","Mitochondria","Vacuole"],correct:2,exp:"Mitochondria generate ATP energy through cellular respiration."},
        {q:"Which organelle performs photosynthesis and is found ONLY in plant cells?",choices:["Mitochondria","Ribosome","Nucleus","Chloroplast"],correct:3,exp:"Chloroplasts contain chlorophyll and carry out photosynthesis \u2014 plant cells only."},
        {q:"What is the function of ribosomes?",choices:["Energy production","Protein synthesis","DNA storage","Waste removal"],correct:1,exp:"Ribosomes are protein factories \u2014 they build proteins from amino acids."},
        {q:"Which is a difference between plant and animal cells?",choices:["Only animal cells have a nucleus","Only plant cells have mitochondria","Plant cells have a cell wall; animal cells do not","Animal cells have chloroplasts"],correct:2,exp:"Plant cells have a rigid cell wall (cellulose). Animal cells only have a flexible cell membrane."},
        {q:"What are the raw materials needed for photosynthesis?",choices:["Glucose and oxygen","Carbon dioxide, water, and light energy","ATP and carbon dioxide","Oxygen and glucose"],correct:1,exp:"Photosynthesis takes CO\u2082 + H\u2082O + light energy and converts them into glucose and oxygen."},
        {q:"Cellular respiration takes place in which organelle?",choices:["Chloroplast","Nucleus","Ribosome","Mitochondria"],correct:3,exp:"Mitochondria convert glucose + O\u2082 into ATP energy."},
        {q:"What does the nucleus of a cell contain?",choices:["ATP energy","Genetic information (DNA)","Glucose molecules","Chlorophyll"],correct:1,exp:"The nucleus stores the cell's DNA \u2014 the genetic blueprint."},
        {q:"A prokaryotic cell differs from a eukaryotic cell because it:",choices:["Has no cell membrane","Has no true membrane-bound nucleus","Has no ribosomes","Cannot reproduce"],correct:1,exp:"Prokaryotes lack a membrane-bound nucleus \u2014 DNA floats in cytoplasm."},
        {q:"What gas is released as a by-product of photosynthesis?",choices:["Carbon dioxide (CO\u2082)","Nitrogen (N\u2082)","Oxygen (O\u2082)","Hydrogen (H\u2082)"],correct:2,exp:"Photosynthesis releases oxygen (O\u2082) \u2014 the source of atmospheric oxygen."},
        {q:"The large central vacuole in plant cells is mainly used for:",choices:["Protein synthesis","Energy production","Storage and maintaining turgor pressure","DNA replication"],correct:2,exp:"The central vacuole stores water/nutrients and maintains rigid cell shape via turgor pressure."}
      ]
    },
    bio_genetics: {
      spellId:'crystal_rain', spellName:'Crystal Rain', spellEmoji:'\uD83C\uDF11', spellElement:'earth', spellStatus:null,
      topicTitle:'Genetics & DNA', topicColor:'#4ade80',
      pages:[
        {heading:'\uD83E\uDDEC Page 1: DNA & Genes',content:'<p><strong>DNA</strong> (Deoxyribonucleic Acid) carries genetic instructions in a double helix held together by base pairs.</p><div class="study-formula-box">4 Bases: A\u2013T pair | G\u2013C pair (Adenine\u2013Thymine | Guanine\u2013Cytosine)</div><p>A <strong>gene</strong> is a section of DNA coding for a specific protein or trait. Humans have ~23 chromosome pairs (46 total).</p>'},
        {heading:'\uD83D\uDD00 Page 2: Heredity & Punnett Squares',content:'<p><strong>Dominant (T)</strong> \u2014 expressed with just one copy. <strong>Recessive (t)</strong> \u2014 needs two copies to show.</p><div class="study-formula-box">TT = Homozygous dominant | Tt = Heterozygous (carrier) | tt = Homozygous recessive</div><p>Punnett square Tt \u00D7 Tt gives TT:Tt:tt = 1:2:1 \u2192 25% chance of recessive (tt) offspring.</p>'},
        {heading:'\uD83D\uDD2C Page 3: Cell Division',content:'<p><strong>Mitosis</strong> \u2014 produces 2 identical diploid cells (46 chromosomes each). Used for growth & repair.</p><div class="study-formula-box">Phases: Prophase \u2192 Metaphase \u2192 Anaphase \u2192 Telophase (PMAT)</div><p><strong>Meiosis</strong> \u2014 produces 4 genetically unique haploid cells (23 chromosomes each). Used for sexual reproduction.</p>'}
      ],
      questions:[
        {q:"What is the full name of DNA?",choices:["Dinitrogen Acid","Deoxyribonucleic Acid","Double Nitrogen Amino Acid","Dioxynucleic Acid"],correct:1,exp:"DNA = Deoxyribonucleic Acid \u2014 the molecule carrying genetic instructions."},
        {q:"Which bases pair together in DNA?",choices:["A\u2013G and T\u2013C","A\u2013T and G\u2013C","A\u2013C and G\u2013T","A\u2013A and T\u2013T"],correct:1,exp:"Adenine pairs with Thymine (A\u2013T) and Guanine pairs with Cytosine (G\u2013C)."},
        {q:"TT x tt cross: proportion of tall offspring (T is dominant)?",choices:["0%","25%","50%","100%"],correct:3,exp:"All offspring are Tt; T (tall) is dominant \u2192 100% tall."},
        {q:"Tt x Tt cross: probability of homozygous recessive (tt) offspring?",choices:["25%","50%","75%","0%"],correct:0,exp:"1TT:2Tt:1tt \u2192 1 in 4 = 25% chance of tt."},
        {q:"Chromosomes line up at the cell equator during:",choices:["Prophase","Metaphase","Anaphase","Telophase"],correct:1,exp:"In Metaphase, chromosomes align at the metaphase plate."},
        {q:"Meiosis produces:",choices:["2 identical diploid cells","4 genetically unique haploid cells","1 cell with double chromosomes","4 identical diploid cells"],correct:1,exp:"Meiosis creates 4 unique haploid cells \u2014 sperm or eggs."},
        {q:"A section of DNA coding for a specific trait is called a:",choices:["Chromosome","Ribosome","Gene","Codon"],correct:2,exp:"A gene is a specific DNA segment that codes for a protein or trait."},
        {q:"A person with genotype Tt is described as:",choices:["Homozygous dominant","Heterozygous","Homozygous recessive","Carrier of recessive only"],correct:1,exp:"Tt has two different alleles \u2014 heterozygous. They show the dominant trait but carry the recessive."},
        {q:"Humans have how many pairs of chromosomes?",choices:["23 pairs (46 total)","24 pairs (48 total)","22 pairs (44 total)","46 pairs (92 total)"],correct:0,exp:"23 pairs = 46 total chromosomes in human body cells."},
        {q:"Mitosis produces cells used for:",choices:["Sexual reproduction only","Growth, repair, and asexual reproduction","Making sex cells (sperm/eggs)","Creating genetic variation"],correct:1,exp:"Mitosis = 2 genetically identical cells for growth and repair."}
      ]
    },
    phys_electricity: {
      spellId:'thunder_tempest', spellName:'Thunder Tempest', spellEmoji:'\u26A1', spellElement:'air', spellStatus:'\u26A1 Stun',
      topicTitle:'Electricity & Circuits', topicColor:'#a855f7',
      pages:[
        {heading:"\u26A1 Page 1: Ohm's Law",content:"<p><strong>Current (I)</strong> \u2014 flow of electrons. Amperes (A).<br><strong>Voltage (V)</strong> \u2014 push driving current. Volts (V).<br><strong>Resistance (R)</strong> \u2014 opposition to current. Ohms (\u03A9).</p><div class=\"study-formula-box\">Ohm's Law: V = I \u00D7 R<br>I = V \u00F7 R | R = V \u00F7 I</div><p>A complete circuit (no gaps) is required for current to flow.</p>"},
        {heading:'\uD83D\uDD0C Page 2: Series vs Parallel Circuits',content:'<p><strong>Series Circuit</strong> \u2014 one single loop. Same current throughout. Voltage is shared. One component breaks \u2192 all stop.</p><p><strong>Parallel Circuit</strong> \u2014 separate branches. Same voltage across every branch. Current splits. One branch breaks \u2192 others keep working. Used in household wiring.</p>'},
        {heading:'\uD83D\uDD0B Page 3: Electrical Power & Energy',content:'<div class="study-formula-box">Power: P = V \u00D7 I (Watts)<br>Energy: E = P \u00D7 t (Joules or kWh)</div><p>Static electricity is produced by friction \u2014 electrons transfer causing charge imbalance. Lightning = static discharge from clouds to ground.</p><p><strong>Conductors</strong> (metals) allow current. <strong>Insulators</strong> (rubber, plastic) block current.</p>'}
      ],
      questions:[
        {q:"What does Ohm's Law state?",choices:["V = I + R","V = I \u00D7 R","I = V \u00D7 R","R = V \u00D7 I\u00B2"],correct:1,exp:"Ohm's Law: Voltage = Current \u00D7 Resistance (V = IR)."},
        {q:"In a SERIES circuit, if one bulb burns out, what happens to the others?",choices:["They get brighter","They stay the same","They all go out","They run in parallel instead"],correct:2,exp:"Series has one path \u2014 any break stops all current."},
        {q:"What is the unit of electrical resistance?",choices:["Amperes","Volts","Watts","Ohms (\u03A9)"],correct:3,exp:"Resistance is measured in Ohms (\u03A9)."},
        {q:"A circuit has 12V and 4\u03A9 resistance. What is the current?",choices:["48A","8A","3A","16A"],correct:2,exp:"I = V \u00F7 R = 12 \u00F7 4 = 3 Amperes."},
        {q:"Household wiring uses parallel circuits because:",choices:["It is cheaper","Each appliance can be switched independently","It uses less wire","It needs lower voltage"],correct:1,exp:"Parallel circuits let each branch work independently."},
        {q:"What is the formula for electrical power?",choices:["P = V + I","P = V \u00D7 I","P = I \u00F7 V","P = R \u00D7 V"],correct:1,exp:"Power P = Voltage \u00D7 Current (P = VI), measured in Watts."},
        {q:"A lightning bolt is an example of:",choices:["Magnetic energy","Static electricity discharging","Nuclear energy","Chemical energy"],correct:1,exp:"Lightning = massive static electricity discharge from clouds to ground."},
        {q:"Which material is an electrical CONDUCTOR?",choices:["Rubber","Plastic","Wood","Copper wire"],correct:3,exp:"Copper and metals are excellent conductors \u2014 free electrons allow easy current flow."},
        {q:"A 60W device runs for 2 hours. Energy consumed:",choices:["30 Joules","120 Watt-hours","60 Joules","30 Watt-hours"],correct:1,exp:"E = P \u00D7 t = 60W \u00D7 2h = 120 Watt-hours."},
        {q:"In a PARALLEL circuit, voltage across each branch is:",choices:["Split equally between branches","The same as the total supply voltage","Zero in disconnected branches","Higher in branches with more resistance"],correct:1,exp:"Every parallel branch receives the full supply voltage."}
      ]
    },
    phys_newton: {
      spellId:'galvanic_cyclone', spellName:'Galvanic Cyclone', spellEmoji:'\uD83C\uDF2A\uFE0F', spellElement:'air', spellStatus:null,
      topicTitle:"Newton's Laws & Forces", topicColor:'#c084fc',
      pages:[
        {heading:"\u2696\uFE0F Page 1: Newton's Three Laws",content:"<p><strong>1st Law (Inertia):</strong> An object stays at rest or in motion UNLESS an unbalanced force acts on it.</p><p><strong>2nd Law: F = ma</strong></p><div class=\"study-formula-box\">Force (N) = Mass (kg) \u00D7 Acceleration (m/s\u00B2)</div><p><strong>3rd Law (Action-Reaction):</strong> Every action has equal and opposite reaction.<br>Example: Rocket pushes gas down \u2192 gas pushes rocket up.</p>"},
        {heading:'\uD83D\uDCD0 Page 2: Types of Forces',content:'<div class="study-formula-box">Gravity | Friction | Air resistance (drag) | Normal force | Upthrust | Tension</div><p><strong>Weight vs Mass:</strong></p><div class="study-formula-box">Weight (N) = Mass (kg) \u00D7 g (9.8 m/s\u00B2)<br>Mass is constant. Weight changes with gravity.</div>'},
        {heading:'\uD83D\uDE80 Page 3: Momentum & Work',content:'<div class="study-formula-box">Momentum: p = m \u00D7 v (kg\u00B7m/s)<br>Conservation: total momentum before = total momentum after a collision</div><div class="study-formula-box">Work: W = F \u00D7 d (Joules)<br>Work only done when force causes movement in direction of the force.</div>'}
      ],
      questions:[
        {q:"A moving object continues moving UNLESS:",choices:["It gains mass","An unbalanced force acts on it","Time passes","It encounters heat"],correct:1,exp:"Newton's 1st Law: objects maintain motion unless acted on by an unbalanced net force."},
        {q:"A 10 kg object accelerates at 3 m/s\u00B2. Force applied?",choices:["3.3 N","13 N","7 N","30 N"],correct:3,exp:"F = ma = 10 \u00D7 3 = 30 N."},
        {q:"Newton's 3rd Law tells us forces always occur:",choices:["In isolation","In pairs \u2014 equal and opposite","In the same direction","Only on large objects"],correct:1,exp:"For every action there is an equal and opposite reaction."},
        {q:"A rocket expels gas downward. What happens to the rocket?",choices:["It slows down","It moves downward","It moves upward (opposite direction)","Nothing changes"],correct:2,exp:"Action: gas pushed down. Reaction: rocket pushed up (Newton's 3rd Law)."},
        {q:"Weight of a 5 kg object on Earth (g = 9.8 m/s\u00B2)?",choices:["5 N","9.8 N","49 N","50 N"],correct:2,exp:"Weight = m \u00D7 g = 5 \u00D7 9.8 = 49 N."},
        {q:"Momentum of a 2 kg object moving at 6 m/s?",choices:["3 kg\u00B7m/s","8 kg\u00B7m/s","12 kg\u00B7m/s","4 kg\u00B7m/s"],correct:2,exp:"p = mv = 2 \u00D7 6 = 12 kg\u00B7m/s."},
        {q:"Which force opposes sliding motion between surfaces?",choices:["Gravity","Tension","Normal force","Friction"],correct:3,exp:"Friction is the contact force opposing relative sliding motion."},
        {q:"A 30 N force moves an object 5 metres. Work done?",choices:["6 J","25 J","150 J","35 J"],correct:2,exp:"W = F \u00D7 d = 30 \u00D7 5 = 150 Joules."},
        {q:"Zero net force on a moving object \u2014 the object will:",choices:["Speed up gradually","Slow down and stop","Continue at constant velocity","Change direction randomly"],correct:2,exp:"Zero net force = no acceleration = constant velocity (Newton's 1st Law)."},
        {q:"Increasing mass while keeping the same force: acceleration will:",choices:["Increase","Decrease","Have no effect","Double instantly"],correct:1,exp:"a = F/m. More mass with same force \u2192 less acceleration (inversely proportional)."}
      ]
    }
  };

  let cTopicKey=null,cTopicData=null,cStudyPage=0,tQs=[],tIdx=0,tAnswers=[],tTimer=null,tLeft=45;

  const renderTrainingScreen=()=>{const card=document.getElementById('training-content-card');if(!card)return;cTopicKey=null;cStudyPage=0;renderGrid(card);};

  const elemColors={fire:'#ef4444',water:'#38bdf8',earth:'#22c55e',air:'#a855f7'};

  const renderGrid=(card)=>{
    const ul=getUnlocked();const ks=Object.keys(topics);
    card.innerHTML=`<div style="text-align:center;margin-bottom:22px;"><h3 style="margin:0 0 6px;font-size:1.3rem;color:#f8fafc;font-weight:800;">\uD83D\uDD12 Locked Spell Tomes</h3><p style="color:#94a3b8;font-size:0.88rem;margin:0;">Study a topic and pass the 10-question test (80%+) to permanently unlock that spell in battle.</p></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;">${ks.map(k=>{const t=topics[k];const done=!!ul[t.spellId];const col=elemColors[t.spellElement]||'#94a3b8';return`<div style="background:rgba(15,23,42,0.85);border:1.5px solid ${done?col:'rgba(255,255,255,0.1)'};border-radius:14px;padding:18px;position:relative;box-shadow:${done?`0 0 18px ${col}33`:'none'};"><div style="position:absolute;top:10px;right:10px;">${done?`<span style="background:${col};color:#fff;font-size:0.7rem;font-weight:800;padding:2px 8px;border-radius:20px;">\u2705 UNLOCKED</span>`:'\uD83D\uDD12'}</div><div style="font-size:2rem;margin-bottom:8px;">${t.spellEmoji}</div><div style="font-weight:800;font-size:1rem;color:${col};margin-bottom:4px;">${t.spellName}</div>${t.spellStatus?`<div style="font-size:0.75rem;background:rgba(255,255,255,0.06);display:inline-block;padding:2px 8px;border-radius:20px;color:#cbd5e1;margin-bottom:8px;">Inflicts ${t.spellStatus}</div>`:'<div style="margin-bottom:12px;"></div>'}<div style="font-size:0.82rem;color:#94a3b8;margin-bottom:14px;">\uD83D\uDCDA ${t.topicTitle}</div><button class="cta-btn ${done?'secondary':'primary'} small" data-start-topic="${k}" style="width:100%;font-size:0.8rem;padding:8px;">${done?'\uD83D\uDCD6 Review Material':'\uD83D\uDCD6 Study & Take Test'}</button></div>`;}).join('')}</div>`;
    card.querySelectorAll('[data-start-topic]').forEach(btn=>{btn.addEventListener('click',()=>{if(window.AudioEngine)window.AudioEngine.playClick();startStudy(btn.getAttribute('data-start-topic'));});});
  };

  const startStudy=(k)=>{cTopicKey=k;cTopicData=topics[k];cStudyPage=0;renderStudyPage();};

  const injectStyle=()=>{if(!document.getElementById('study-style')){const s=document.createElement('style');s.id='study-style';s.textContent='.study-formula-box{background:rgba(15,23,42,0.85);border-left:3px solid #a855f7;padding:10px 14px;border-radius:8px;font-family:"Fira Code",monospace;font-size:0.88rem;color:#e2e8f0;margin:10px 0;line-height:1.6;}';document.head.appendChild(s);}};

  const renderStudyPage=()=>{
    const card=document.getElementById('training-content-card');if(!card)return;
    injectStyle();
    const t=cTopicData;const page=t.pages[cStudyPage];const isLast=cStudyPage===t.pages.length-1;const done=isUnlocked(t.spellId);
    card.innerHTML=`<div style="max-width:700px;margin:0 auto;"><button id="study-back" style="background:none;border:1px solid rgba(255,255,255,0.15);color:#94a3b8;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:0.82rem;margin-bottom:18px;">\u2190 Back to Spell Grid</button><div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;padding:16px;background:rgba(255,255,255,0.04);border:1px solid ${t.topicColor}44;border-radius:12px;"><span style="font-size:2.4rem;">${t.spellEmoji}</span><div><div style="font-weight:800;font-size:1.1rem;color:${t.topicColor};">${t.spellName}</div><div style="font-size:0.82rem;color:#94a3b8;">\uD83D\uDCDA ${t.topicTitle}</div></div></div><div style="display:flex;gap:6px;margin-bottom:16px;align-items:center;">${t.pages.map((_,i)=>`<div style="height:5px;flex:1;border-radius:9px;background:${i<=cStudyPage?t.topicColor:'rgba(255,255,255,0.1)'};transition:background 0.3s;"></div>`).join('')}<span style="font-size:0.78rem;color:#94a3b8;white-space:nowrap;margin-left:6px;">Page ${cStudyPage+1}/${t.pages.length}</span></div><div class="glass" style="border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:22px;margin-bottom:20px;background:rgba(15,23,42,0.8);"><h3 style="margin:0 0 14px;font-size:1.1rem;color:#f8fafc;font-weight:800;">${page.heading}</h3><div style="color:#cbd5e1;font-size:0.92rem;line-height:1.75;">${page.content}</div></div><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;"><button id="study-prev" ${cStudyPage===0?'disabled':''} style="padding:10px 22px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:${cStudyPage===0?'#475569':'#f8fafc'};cursor:${cStudyPage===0?'not-allowed':'pointer'};font-size:0.9rem;font-weight:600;">\u2190 Previous</button>${isLast?`<button id="take-test" style="padding:12px 32px;border-radius:10px;font-size:1rem;font-weight:800;background:linear-gradient(135deg,${t.topicColor},${t.topicColor}99);border:none;color:#fff;cursor:pointer;box-shadow:0 4px 20px ${t.topicColor}55;flex:1;max-width:300px;">${done?'\uD83D\uDCDD Retake Test':'\uD83D\uDCDD Take the Test (10 Questions)'}</button>`:`<button id="study-next" style="padding:12px 32px;border-radius:10px;font-size:0.95rem;font-weight:700;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:#f8fafc;cursor:pointer;flex:1;max-width:300px;">Next Page \u2192</button>`}</div></div>`;
    document.getElementById('study-back').onclick=()=>{if(window.AudioEngine)window.AudioEngine.playClick();renderTrainingScreen();};
    const pb=document.getElementById('study-prev');if(pb)pb.onclick=()=>{if(window.AudioEngine)window.AudioEngine.playClick();cStudyPage--;renderStudyPage();};
    const nb=document.getElementById('study-next');if(nb)nb.onclick=()=>{if(window.AudioEngine)window.AudioEngine.playClick();cStudyPage++;renderStudyPage();};
    const tb=document.getElementById('take-test');if(tb)tb.onclick=()=>{if(window.AudioEngine)window.AudioEngine.playClick();startTest();};
  };

  const startTest=()=>{tQs=[...cTopicData.questions].sort(()=>Math.random()-0.5);tIdx=0;tAnswers=[];renderQ();};

  const renderQ=()=>{
    const card=document.getElementById('training-content-card');if(!card)return;
    if(tIdx>=tQs.length){renderResults();return;}
    clearInterval(tTimer);tLeft=45;
    const q=tQs[tIdx];const t=cTopicData;const prog=Math.round((tIdx/tQs.length)*100);
    card.innerHTML=`<div style="max-width:660px;margin:0 auto;"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;"><div style="font-weight:800;font-size:0.95rem;color:${t.topicColor};">${t.spellEmoji} ${t.topicTitle} \u2014 Test</div><div id="timer-el" style="background:rgba(168,85,247,0.15);border:1px solid #a855f7;padding:6px 14px;border-radius:20px;font-weight:800;font-size:1rem;color:#c084fc;min-width:60px;text-align:center;">\u23F1 ${tLeft}s</div></div><div style="margin-bottom:18px;"><div style="display:flex;justify-content:space-between;font-size:0.78rem;color:#94a3b8;margin-bottom:5px;"><span>Question ${tIdx+1} of ${tQs.length}</span><span>${tAnswers.filter(Boolean).length} correct so far</span></div><div style="height:6px;background:rgba(255,255,255,0.08);border-radius:9px;overflow:hidden;"><div style="height:100%;width:${prog}%;background:${t.topicColor};border-radius:9px;transition:width 0.3s;"></div></div></div><div style="background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:22px;margin-bottom:18px;"><p style="margin:0;font-size:1.05rem;color:#f8fafc;font-weight:600;line-height:1.65;">${q.q}</p></div><div id="choices" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">${q.choices.map((c,i)=>`<button class="test-choice-btn" data-index="${i}" style="padding:14px 16px;border-radius:10px;border:1.5px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f8fafc;font-size:0.88rem;text-align:left;cursor:pointer;transition:all 0.2s;line-height:1.4;"><span style="color:${t.topicColor};font-weight:800;margin-right:6px;">${String.fromCharCode(65+i)}.</span>${c}</button>`).join('')}</div><div id="exp-el" style="display:none;padding:14px 18px;border-radius:10px;font-size:0.88rem;margin-bottom:14px;line-height:1.6;"></div><div id="cont-row" style="display:none;text-align:center;"><button id="cont-btn" style="padding:10px 36px;border-radius:10px;border:none;font-size:0.95rem;font-weight:800;background:linear-gradient(135deg,${t.topicColor},${t.topicColor}88);color:#fff;cursor:pointer;">${tIdx+1<tQs.length?'Next Question \u2192':'\uD83D\uDCCA See Results'}</button></div></div>`;
    const timerEl=document.getElementById('timer-el');
    tTimer=setInterval(()=>{tLeft--;if(timerEl)timerEl.innerText=`\u23F1 ${tLeft}s`;if(tLeft<=0){clearInterval(tTimer);handleAns(-1);}},1000);
    card.querySelectorAll('.test-choice-btn').forEach(btn=>{btn.addEventListener('click',()=>{clearInterval(tTimer);handleAns(parseInt(btn.getAttribute('data-index')));});});
  };

  const handleAns=(ci)=>{
    const card=document.getElementById('training-content-card');const q=tQs[tIdx];const ok=ci===q.correct;tAnswers.push(ok);
    card.querySelectorAll('.test-choice-btn').forEach((btn,i)=>{btn.disabled=true;if(i===q.correct){btn.style.background='rgba(34,197,94,0.2)';btn.style.borderColor='#22c55e';btn.style.color='#4ade80';}else if(i===ci&&!ok){btn.style.background='rgba(239,68,68,0.2)';btn.style.borderColor='#ef4444';btn.style.color='#fca5a5';}});
    if(ok){if(window.AudioEngine)window.AudioEngine.playCorrect();}else{if(window.AudioEngine)window.AudioEngine.playIncorrect();}
    const ex=document.getElementById('exp-el');if(ex){ex.style.display='block';ex.style.background=ok?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)';ex.style.border=`1px solid ${ok?'#22c55e':'#ef4444'}`;ex.style.color=ok?'#4ade80':'#fca5a5';ex.innerHTML=`${ok?'\u2705 Correct!':`\u274C ${ci===-1?'\u23F1 Time out!':'Incorrect.'}`} ${q.exp}`;}
    const cr=document.getElementById('cont-row');if(cr)cr.style.display='block';
    document.getElementById('cont-btn').onclick=()=>{if(window.AudioEngine)window.AudioEngine.playClick();tIdx++;renderQ();};
  };

  const renderResults=()=>{
    const card=document.getElementById('training-content-card');const t=cTopicData;
    const score=tAnswers.filter(Boolean).length;const total=tAnswers.length;const pct=Math.round((score/total)*100);const passed=pct>=80;const alreadyHad=isUnlocked(t.spellId);
    if(passed&&!alreadyHad){unlockSpell(t.spellId);if(window.AudioEngine)window.AudioEngine.playSparkle();}
    card.innerHTML=`<div style="max-width:560px;margin:0 auto;text-align:center;padding:10px;"><div style="font-size:4rem;margin-bottom:12px;">${passed?'\uD83C\uDF89':'\uD83D\uDE14'}</div><h2 style="margin:0 0 6px;font-size:1.6rem;color:${passed?'#4ade80':'#fca5a5'};font-weight:900;">${passed?'SPELL UNLOCKED!':'Not Quite There'}</h2><p style="color:#94a3b8;font-size:0.95rem;margin:0 0 24px;">${passed?`You mastered <strong style="color:${t.topicColor}">${t.topicTitle}</strong> and unlocked a powerful spell!`:'Score below 80%. Re-read the study material and try again.'}</p><div style="width:130px;height:130px;border-radius:50%;border:6px solid ${passed?'#4ade80':'#ef4444'};display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 24px;background:rgba(15,23,42,0.9);box-shadow:0 0 30px ${passed?'#4ade8044':'#ef444444'};"><span style="font-size:2rem;font-weight:900;color:${passed?'#4ade80':'#fca5a5'};">${pct}%</span><span style="font-size:0.75rem;color:#94a3b8;">${score}/${total} correct</span></div>${passed?`<div style="background:rgba(255,255,255,0.04);border:1.5px solid ${t.topicColor};border-radius:14px;padding:18px;margin-bottom:22px;box-shadow:0 0 20px ${t.topicColor}33;"><div style="font-size:2.5rem;margin-bottom:8px;">${t.spellEmoji}</div><div style="font-size:1.2rem;font-weight:900;color:${t.topicColor};margin-bottom:4px;">${t.spellName}</div>${t.spellStatus?`<div style="font-size:0.82rem;color:#94a3b8;">Inflicts: ${t.spellStatus}</div>`:''}<div style="margin-top:8px;font-size:0.82rem;color:#64748b;">${alreadyHad?'You already had this spell.':'\u2728 Added to your battle spell deck!'}</div></div>`:''}<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">${!passed?`<button id="retry-btn" style="padding:12px 28px;border-radius:10px;border:none;font-size:0.95rem;font-weight:800;background:linear-gradient(135deg,${t.topicColor},${t.topicColor}88);color:#fff;cursor:pointer;">\uD83D\uDCD6 Study & Retry</button>`:''}<button id="back-btn" style="padding:12px 28px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:#f8fafc;font-size:0.95rem;font-weight:700;cursor:pointer;">\u2190 Back to Spells</button></div></div>`;
    const rb=document.getElementById('retry-btn');if(rb)rb.onclick=()=>{if(window.AudioEngine)window.AudioEngine.playClick();cStudyPage=0;renderStudyPage();};
    document.getElementById('back-btn').onclick=()=>{if(window.AudioEngine)window.AudioEngine.playClick();renderTrainingScreen();};
  };

  return {isUnlocked,renderTrainingScreen,getTopics:()=>topics};
})();
window.TrainingEngine=TrainingEngine;
