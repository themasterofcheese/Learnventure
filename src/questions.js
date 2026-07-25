/* ==========================================================================
   KNOWLEDGE QUEST - QUESTION ENGINE
   STEM Database, Rescue Questions, & Procedural Generators
   ========================================================================== */

const QuestionEngine = (() => {
  // Static question bank for normal battle spells
  const questionBank = {
    math: {
      4: [
        { q: "Subtract the fractions: 5/8 - 2/8.", choices: ["1/8", "3/8", "7/8", "1/2"], correct: 1, exp: "Since denominators are the same, subtract numerators: 5 - 2 = 3. So, the answer is 3/8." },
        { q: "What is the perimeter of a rectangle with length 8 cm and width 5 cm?", choices: ["13 cm", "26 cm", "40 cm", "30 cm"], correct: 1, exp: "Perimeter = 2 * (length + width) = 2 * (8 + 5) = 2 * 13 = 26 cm." }
      ],
      6: [
        { q: "Simplify the ratio 18:24 to its lowest terms.", choices: ["9:12", "6:8", "3:4", "2:3"], correct: 2, exp: "Divide both sides by their Greatest Common Divisor, which is 6. 18/6 = 3 and 24/6 = 4. Ratio is 3:4." },
        { q: "Find the area of a triangle with a base of 10 cm and a height of 6 cm.", choices: ["60 cm²", "30 cm²", "16 cm²", "20 cm²"], correct: 1, exp: "Area of a triangle = (Base * Height) / 2 = (10 * 6) / 2 = 30 cm²." },
        { q: "What is 25% of 80?", choices: ["15", "20", "25", "40"], correct: 1, exp: "25% is equal to 1/4. 80 / 4 = 20." },
        { q: "Solve for y in the equation: y - 15 = 32.", choices: ["17", "47", "42", "37"], correct: 1, exp: "Add 15 to both sides: y = 32 + 15 = 47." },
        { q: "What is the greatest common factor (GCF) of 24 and 36?", choices: ["6", "8", "12", "18"], correct: 2, exp: "The factors of 24 are 1, 2, 3, 4, 6, 8, 12, 24. The factors of 36 are 1, 2, 3, 4, 6, 9, 12, 18, 36. The highest common one is 12." }
      ],
      8: [
        { q: "What is the slope of the line given by the equation y = -3x + 8?", choices: ["8", "3", "-3", "-8"], correct: 2, exp: "The slope-intercept form is y = mx + b, where m is the slope. In y = -3x + 8, the slope is -3." },
        { q: "A right triangle has legs of lengths 6 cm and 8 cm. What is the length of its hypotenuse?", choices: ["10 cm", "14 cm", "48 cm", "12 cm"], correct: 0, exp: "By Pythagorean Theorem: a² + b² = c². 6² + 8² = 36 + 64 = 100. √100 = 10 cm." }
      ],
      10: [
        { q: "Solve for x in the quadratic equation: x² - 5x + 6 = 0.", choices: ["x = 1 or 6", "x = 2 or 3", "x = -2 or -3", "x = 5 or 6"], correct: 1, exp: "Factoring the equation gives (x - 2)(x - 3) = 0. Therefore, x = 2 or x = 3." },
        { q: "What is the value of log₂ (64)?", choices: ["4", "5", "6", "8"], correct: 2, exp: "Logarithm base 2 of 64 is the exponent to which 2 must be raised to yield 64. Since 2⁶ = 64, the answer is 6." }
      ]
    },
    bio: {
      4: [
        { q: "Which part of the plant absorbs water and minerals from the soil?", choices: ["Leaves", "Roots", "Stems", "Flowers"], correct: 1, exp: "Roots anchor the plant and absorb water and essential minerals from the ground." },
        { q: "What is the primary process plants use to make their own food using sunlight?", choices: ["Respiration", "Photosynthesis", "Pollination", "Transpiration"], correct: 1, exp: "Photosynthesis is the chemical process where plants convert sunlight, carbon dioxide, and water into sugars." }
      ],
      6: [
        { q: "Which cell organelle acts as the control center, containing DNA?", choices: ["Mitochondria", "Nucleus", "Ribosome", "Vacuole"], correct: 1, exp: "The nucleus holds the cell's genetic blueprints (DNA) and coordinates cellular functions." },
        { q: "What is an organism that makes its own food using sunlight called?", choices: ["Producer", "Consumer", "Decomposer", "Herbivore"], correct: 0, exp: "Organisms that make their own nutrients via photosynthesis are called producers." },
        { q: "Which green pigment in plant cells absorbs light energy for photosynthesis?", choices: ["Cytoplasm", "Chlorophyll", "Cellulose", "Carotene"], correct: 1, exp: "Chlorophyll is the green pigment in chloroplasts that captures sunlight." },
        { q: "What is the basic unit of structure and function in all living organisms?", choices: ["Atom", "Molecule", "Cell", "Organ"], correct: 2, exp: "Cells are the smallest structural and functional unit of life." },
        { q: "Which body system is responsible for pumping blood and delivering oxygen?", choices: ["Respiratory", "Digestive", "Circulatory", "Nervous"], correct: 2, exp: "The circulatory system consists of the heart and blood vessels, pumping oxygenated blood." }
      ],
      8: [
        { q: "If a homozygous dominant tall pea plant (TT) is crossed with a homozygous recessive short plant (tt), what percentage of offspring will be tall?", choices: ["25%", "50%", "75%", "100%"], correct: 3, exp: "All offspring will inherit one dominant allele and one recessive allele (Tt). Since tall is dominant, 100% will be tall." },
        { q: "Which molecule stores the genetic blueprint of an organism?", choices: ["RNA", "DNA", "Protein", "Lipid"], correct: 1, exp: "DNA (Deoxyribonucleic Acid) is the molecule carrying genetic instructions for all living organisms." }
      ],
      10: [
        { q: "Which phase of mitosis involves chromosomes lining up along the middle cell plate?", choices: ["Prophase", "Metaphase", "Anaphase", "Telophase"], correct: 1, exp: "In Metaphase, chromosomes align along the equator (metaphase plate) before being pulled apart." },
        { q: "What is the primary product of cellular respiration used as cellular fuel?", choices: ["Glucose", "Carbon Dioxide", "ATP", "Oxygen"], correct: 2, exp: "Cellular respiration converts biochemical energy from nutrients into ATP (Adenosine Triphosphate)." }
      ]
    },
    chem: {
      4: [
        { q: "Which state of matter has a fixed volume but takes the shape of its container?", choices: ["Solid", "Liquid", "Gas", "Plasma"], correct: 1, exp: "Liquids flow to match container shape but retain a constant volume under stable conditions." },
        { q: "What happens when liquid water is heated to 100°C (212°F)?", choices: ["It freezes", "It condenses", "It evaporates/boils into gas", "It dissolves"], correct: 2, exp: "At 100°C, water reaches its boiling point and transitions from a liquid to gas (water vapor)." }
      ],
      6: [
        { q: "What is the atomic symbol for the element Oxygen?", choices: ["Ox", "O", "Og", "Oy"], correct: 1, exp: "The chemical symbol for Oxygen is a single capital letter 'O'." },
        { q: "Which of the following is a physical change rather than a chemical change?", choices: ["Baking a cake", "Wood burning", "Ice melting", "Iron rusting"], correct: 2, exp: "Melting ice changes physical state (solid to liquid water) but not chemical makeup, unlike combustion or baking." },
        { q: "What are the three primary subatomic particles that make up an atom?", choices: ["Protons, Neutrons, Electrons", "Cells, Molecules, Atoms", "Solids, Liquids, Gases", "Acids, Bases, Salts"], correct: 0, exp: "Atoms are composed of positively charged protons, neutral neutrons, and negatively charged electrons." },
        { q: "A substance made of two or more different elements chemically bonded together is a:", choices: ["Mixture", "Solution", "Element", "Compound"], correct: 3, exp: "A compound is a chemical union of different elements. Mixtures and solutions are physical combinations." },
        { q: "What state of matter has a definite shape and a definite volume?", choices: ["Solid", "Liquid", "Gas", "Plasma"], correct: 0, exp: "Solids maintain their shape and volume due to closely packed, locked molecules." }
      ],
      8: [
        { q: "What is the chemical formula for table salt?", choices: ["HCl", "NaOH", "NaCl", "NaHCO₃"], correct: 2, exp: "Table salt is Sodium Chloride, represented chemically as NaCl." },
        { q: "What pH value represents a completely neutral substance, such as pure water?", choices: ["0", "1", "7", "14"], correct: 2, exp: "The pH scale ranges from 0 to 14, where 7 represents neutral, lower represents acidic, and higher represents basic." }
      ],
      10: [
        { q: "Which type of chemical bond involves the sharing of electron pairs between atoms?", choices: ["Ionic bond", "Covalent bond", "Hydrogen bond", "Metallic bond"], correct: 1, exp: "Covalent bonding is characterized by the sharing of valence electrons between atoms." },
        { q: "Balance the chemical equation: C₃H₈ + X O₂ -> 3 CO₂ + 4 H₂O. What is X?", choices: ["3", "4", "5", "6"], correct: 2, exp: "The right side has 3*2 + 4 = 10 Oxygen atoms. Thus, we need 5 O₂ molecules on the left side (5 * 2 = 10). X = 5." }
      ]
    },
    phys: {
      4: [
        { q: "Which force pulls objects downward toward the center of the Earth?", choices: ["Magnetism", "Gravity", "Friction", "Air Resistance"], correct: 1, exp: "Gravity is the attractive force that draws all physical mass toward the center of the planet." },
        { q: "Which simple machine consists of a grooved wheel and a rope used to lift heavy loads?", choices: ["Lever", "Inclined Plane", "Pulley", "Screw"], correct: 2, exp: "A pulley uses a wheel and rope system to change force direction, making it easier to lift objects." }
      ],
      6: [
        { q: "Which force opposes motion when two surfaces slide against each other?", choices: ["Gravity", "Friction", "Magnetism", "Inertia"], correct: 1, exp: "Friction is the contact force resisting relative movement between sliding surfaces." },
        { q: "A roller coaster parked at the very top of a hill has mostly what type of energy?", choices: ["Kinetic energy", "Potential energy", "Thermal energy", "Sound energy"], correct: 1, exp: "An object positioned at height stores gravitational potential energy." },
        { q: "What is the standard unit of measurement for force?", choices: ["Joule", "Watt", "Newton", "Volt"], correct: 2, exp: "In the metric system, force is measured in Newtons (N)." },
        { q: "Which simple machine is a flat, slanted surface used to move heavy loads upward?", choices: ["Lever", "Pulley", "Inclined plane", "Wedge"], correct: 2, exp: "An inclined plane reduces the force needed to raise objects by spreading it over a distance." },
        { q: "If you increase the mass of an object, what happens to the gravitational pull acting on it?", choices: ["It decreases", "It increases", "It stays the same", "It drops to zero"], correct: 1, exp: "Gravitational force is directly proportional to mass; heavier objects experience greater gravitational pull." }
      ],
      8: [
        { q: "What states that 'for every action, there is an equal and opposite reaction'?", choices: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Law of Gravity"], correct: 2, exp: "Newton's Third Law of Motion outlines that force interactions are mutual, with equal magnitude and opposite directions." },
        { q: "How much force is required to accelerate a 5 kg mass at 4 m/s²?", choices: ["9 Newtons", "20 Newtons", "1.25 Newtons", "45 Newtons"], correct: 1, exp: "Using Force = Mass * Acceleration (F=ma): 5 kg * 4 m/s² = 20 Newtons." }
      ],
      10: [
        { q: "What is Ohm's Law formula relating Voltage (V), Current (I), and Resistance (R)?", choices: ["V = I / R", "V = I * R", "I = V * R", "R = V * I"], correct: 1, exp: "Ohm's Law states that Voltage equals Current multiplied by Resistance (V = IR)." },
        { q: "Which type of wave requires a physical medium to travel through?", choices: ["Sound wave", "Light wave", "Radio wave", "X-ray"], correct: 0, exp: "Sound is a mechanical pressure wave that relies on particles (air, water, solids) to propagate. Electromagnetic waves (light, radio) can travel in vacuum." }
      ]
    }
  };

  // Harder "Rescue Questions" for pet capture attempts
  const rescueQuestions = {
    math: {
      4: [
        { q: "Calculate: 15 + 24.", choices: ["39", "29", "49", "35"], correct: 0, exp: "15 + 24 = 39." },
        { q: "What is 10 times 8?", choices: ["80", "18", "90", "70"], correct: 0, exp: "10 * 8 = 80." }
      ],
      6: [
        { q: "A potion bag contains 3 red potions and 6 blue potions. What is the simplified ratio of red to blue potions?", choices: ["1:2", "2:1", "1:3", "3:1"], correct: 0, exp: "Dividing both parts by 3 gives 1:2." },
        { q: "If a creature has 80 Max HP and its health drops to 50%, how much HP does it have left?", choices: ["30 HP", "40 HP", "50 HP", "60 HP"], correct: 1, exp: "50% is half. Half of 80 is 40." },
        { q: "Solve for x: x + 8 = 20.", choices: ["10", "12", "14", "28"], correct: 1, exp: "Subtract 8 from both sides: x = 12." }
      ],
      8: [
        { q: "Calculate the average of 12, 16, and 20.", choices: ["16", "15", "18", "14"], correct: 0, exp: "(12 + 16 + 20) / 3 = 48 / 3 = 16." }
      ],
      10: [
        { q: "A wizard travels at 10 mph for 3 hours, and then 20 mph for 2 hours. What is the average speed of the entire trip?", choices: ["12 mph", "14 mph", "15 mph", "16 mph"], correct: 1, exp: "Total distance = (10*3) + (20*2) = 70 miles. Total time = 5 hours. Average speed = 70/5 = 14 mph." },
        { q: "Solve for x in the system of equations: x + y = 10 and 2x - y = 8.", choices: ["x = 5, y = 5", "x = 6, y = 4", "x = 4, y = 6", "x = 7, y = 3"], correct: 1, exp: "Adding equations: 3x = 18 => x = 6. Substituting back: 6 + y = 10 => y = 4." }
      ]
    },
    bio: {
      4: [
        { q: "What part of a tree performs photosynthesis?", choices: ["Roots", "Trunk", "Leaves", "Bark"], correct: 2, exp: "Leaves contain chlorophyll to absorb light and make food." }
      ],
      6: [
        { q: "Which of these animals is an invertebrate (does NOT have a backbone)?", choices: ["Frog", "Butterfly", "Eagle", "Snake"], correct: 1, exp: "Butterflies are insects, which have an exoskeleton and no backbone." },
        { q: "In a forest ecosystem, which of the following is a producer?", choices: ["Red Fox", "Grizzly Bear", "Green Oak Tree", "Earthworm"], correct: 2, exp: "Oak trees use photosynthesis to make their own food." },
        { q: "Which adaptation helps a polar bear survive in the cold Arctic?", choices: ["Gills for breathing", "Thick layer of blubber and white fur", "Long tail for balance", "Scales for protection"], correct: 1, exp: "Thick blubber insulates, and white fur provides camouflage." }
      ],
      8: [
        { q: "Which cell organelle is known as the powerhouse of the cell?", choices: ["Mitochondria", "Nucleus", "Ribosome", "Vacuole"], correct: 0, exp: "Mitochondria produce energy (ATP) for the cell." }
      ],
      10: [
        { q: "If a double-stranded DNA sample contains 30% Adenine, what percentage of Cytosine does it contain?", choices: ["15%", "20%", "30%", "40%"], correct: 1, exp: "Adenine(30%) = Thymine(30%), totaling 60%. The remaining 40% is shared equally between Guanine and Cytosine (20% each)." },
        { q: "In genetics, crossing a red flower (RR) with a white flower (rr) yields pink flowers (Rr). What is this inheritance pattern?", choices: ["Dominance", "Codominance", "Incomplete Dominance", "Polygenic inheritance"], correct: 2, exp: "Incomplete dominance occurs when the phenotype of a heterozygous offspring is a blend of the parental phenotypes." }
      ]
    },
    chem: {
      4: [
        { q: "What state of matter is steam?", choices: ["Solid", "Liquid", "Gas", "Plasma"], correct: 2, exp: "Steam is water vapor, which is a gas." }
      ],
      6: [
        { q: "Which of the following is a physical change (does not form a new chemical substance)?", choices: ["Baking bread", "Crushing an aluminum can", "Rusting iron", "Burning wood"], correct: 1, exp: "Crushing changes shape but not chemical makeup." },
        { q: "Which state of matter has a fixed volume but can change its shape to fill a glass?", choices: ["Solid", "Liquid", "Gas", "Plasma"], correct: 1, exp: "Liquids flow to match container shape but retain a constant volume." },
        { q: "If you dissolve table salt into a glass of warm water, you have created a:", choices: ["Chemical compound", "New element", "Mechanical mixture", "Solution"], correct: 3, exp: "A solution is a homogeneous mixture where a solute is dissolved." }
      ],
      8: [
        { q: "What is the atomic symbol for Helium?", choices: ["H", "He", "Hl", "Hm"], correct: 1, exp: "The chemical symbol for Helium is He." }
      ],
      10: [
        { q: "Balance the combustion reaction of methane: CH₄ + 2 O₂ -> CO₂ + X H₂O. How many grams of water are produced when 16g of CH₄ (Molar Mass: 16g/mol) burns completely? (Molar Mass H₂O = 18g/mol)", choices: ["18g", "36g", "44g", "72g"], correct: 1, exp: "1 mole of methane (16g) yields 2 moles of water. 2 moles * 18g/mol = 36 grams of water. X = 2." },
        { q: "What is the pH of a solution with a hydrogen ion concentration [H+] of 1.0 x 10^-5 M?", choices: ["pH = -5", "pH = 5", "pH = 7", "pH = 9"], correct: 1, exp: "pH is defined as -log[H+]. For [H+] = 10^-5, pH = -(-5) = 5." }
      ]
    },
    phys: {
      4: [
        { q: "What force pulls a thrown ball back to Earth?", choices: ["Friction", "Gravity", "Magnetism", "Wind"], correct: 1, exp: "Gravity pulls objects down toward Earth's center." }
      ],
      6: [
        { q: "Which material is an excellent conductor of electricity?", choices: ["Rubber eraser", "Wooden stick", "Copper wire", "Plastic spoon"], correct: 2, exp: "Metals like copper allow electricity to flow easily." },
        { q: "What happens in a circuit if there is a break in the wire loop?", choices: ["Electricity flows faster", "The device turns off (circuit is open)", "It causes a short circuit", "Batteries charge up"], correct: 1, exp: "A break opens the circuit, stopping the flow of electricity." },
        { q: "Which of these is a renewable source of energy?", choices: ["Coal", "Natural Gas", "Wind Power", "Crude Oil"], correct: 2, exp: "Wind is an abundant natural resource that will not run out." }
      ],
      8: [
        { q: "What is the standard unit of force?", choices: ["Joule", "Watt", "Newton", "Volt"], correct: 2, exp: "Force is measured in Newtons (N)." }
      ],
      10: [
        { q: "A 5 kg block is pushed across a horizontal surface with a force of 30 N. If friction opposes the block with 10 N, what is the acceleration of the block?", choices: ["2 m/s²", "4 m/s²", "6 m/s²", "8 m/s²"], correct: 1, exp: "Net force = Applied force - Friction = 30N - 10N = 20N. Using a = F/m: 20N / 5kg = 4 m/s²." },
        { q: "A force of 15 Newtons is applied to move an object a distance of 4 meters in the direction of the force. How much Work is done in Joules?", choices: ["3.75 J", "19 J", "60 J", "120 J"], correct: 2, exp: "Work = Force * Distance = 15 N * 4 m = 60 Joules." }
      ]
    }
  };

  // Harder "Boss Questions" for boss encounters
  const bossQuestions = {
    math: {
      4: [
        { q: "What is 12 times 11?", choices: ["132", "122", "142", "121"], correct: 0, exp: "12 * 11 = 132." }
      ],
      6: [
        { q: "A triangular force field has a base of 12 meters and a height of 8 meters. What is its area?", choices: ["96 m²", "48 m²", "20 m²", "36 m²"], correct: 1, exp: "Area = (Base * Height) / 2 = (12 * 8) / 2 = 48 m²." },
        { q: "Find the mean (average) of these test scores: 70, 80, and 90.", choices: ["75", "80", "85", "90"], correct: 1, exp: "Average = (70 + 80 + 90) / 3 = 80." },
        { q: "If a wizard spends 2/5 of their 100 gold coins, how many gold coins do they have left?", choices: ["20 coins", "40 coins", "60 coins", "80 coins"], correct: 2, exp: "2/5 of 100 is 40. Remaining is 100 - 40 = 60 coins." }
      ],
      8: [
        { q: "Solve for x: 3x - 5 = 16.", choices: ["7", "6", "8", "9"], correct: 0, exp: "3x = 21, x = 7." }
      ],
      10: [
        { q: "Solve for x in the equation: 3(x - 4) = 2x + 5.", choices: ["x = 17", "x = 9", "x = 1", "x = 7"], correct: 0, exp: "Expand: 3x - 12 = 2x + 5. Subtract 2x: x - 12 = 5. Add 12: x = 17." },
        { q: "What is the length of the hypotenuse of a right-angled triangle with legs of lengths 5 cm and 12 cm?", choices: ["13 cm", "17 cm", "15 cm", "14 cm"], correct: 0, exp: "By Pythagorean Theorem: 5² + 12² = 25 + 144 = 169. √169 = 13 cm." },
        { q: "Solve for y in the equation: 4y + 7 = 19 - 2y.", choices: ["y = 2", "y = 3", "y = 1", "y = -2"], correct: 0, exp: "Add 2y to both sides: 6y + 7 = 19. Subtract 7: 6y = 12. Divide by 6: y = 2." },
        { q: "What is the slope of the line that passes through the points (2, 5) and (4, 11)?", choices: ["3", "6", "2", "4"], correct: 0, exp: "Slope = (y₂ - y₁) / (x₂ - x₁) = (11 - 5) / (4 - 2) = 6 / 2 = 3." }
      ]
    },
    bio: {
      4: [
        { q: "Which class of animals have fur and nurse their young?", choices: ["Mammals", "Birds", "Reptiles", "Fish"], correct: 0, exp: "Mammals have hair/fur and feed their young milk." }
      ],
      6: [
        { q: "Which class of vertebrates has gills, scales, and is cold-blooded?", choices: ["Amphibians", "Reptiles", "Fish", "Mammals"], correct: 2, exp: "Fish are cold-blooded vertebrates that use gills and have scales." },
        { q: "What gas do plants absorb from the air to perform photosynthesis?", choices: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"], correct: 1, exp: "Plants absorb carbon dioxide and release oxygen." },
        { q: "An animal that eats both plants and other animals is classified as a:", choices: ["Herbivore", "Carnivore", "Omnivore", "Decomposer"], correct: 2, exp: "Omnivores eat both producers (plants) and consumers (animals)." }
      ],
      8: [
        { q: "What molecule stores the genetic code of life?", choices: ["DNA", "RNA", "Protein", "Lipid"], correct: 0, exp: "DNA carries the genetic blueprints." }
      ],
      10: [
        { q: "During which cellular process is glucose broken down in the presence of oxygen to release ATP?", choices: ["Aerobic Respiration", "Photosynthesis", "Fermentation", "Transpiration"], correct: 0, exp: "Aerobic respiration uses oxygen to break down glucose, producing ATP, carbon dioxide, and water." },
        { q: "If one strand of DNA has the nitrogenous base sequence 5'-AGCT-3', what is the complementary strand sequence?", choices: ["TCGA", "AGCT", "UCGA", "TGCA"], correct: 0, exp: "DNA base-pairing rules state Adenine pairs with Thymine (A-T), and Guanine pairs with Cytosine (G-C)." },
        { q: "What is the primary function of the ribosomes within a cell?", choices: ["Protein synthesis", "Energy production", "DNA storage", "Waste elimination"], correct: 0, exp: "Ribosomes translate genetic instructions from RNA into polypeptide chains (proteins)." },
        { q: "Which type of blood vessel carries oxygen-rich blood away from the heart to the rest of the body?", choices: ["Arteries", "Veins", "Capillaries", "Venules"], correct: 0, exp: "Arteries carry blood away from the heart. Veins bring deoxygenated blood back to the heart." }
      ]
    },
    chem: {
      4: [
        { q: "What element has the symbol O?", choices: ["Oxygen", "Gold", "Iron", "Carbon"], correct: 0, exp: "O stands for Oxygen." }
      ],
      6: [
        { q: "Which of these is a chemical change where a brand new substance is created?", choices: ["Dissolving sugar in tea", "Chopping wood with an axe", "A rusty chain forming on a gate", "Melting wax from a candle"], correct: 2, exp: "Rusting creates iron oxide, a brand new chemical substance." },
        { q: "What is the small, dense center of an atom that contains protons and neutrons called?", choices: ["Electron cloud", "Nucleus", "Cell membrane", "Molecule"], correct: 1, exp: "The nucleus is the positive core of the atom, holding protons and neutrons." },
        { q: "Which of the following describes the volume and shape of a gas?", choices: ["Fixed shape and fixed volume", "Fluid shape and fixed volume", "No fixed shape and no fixed volume", "Fixed shape and no fixed volume"], correct: 2, exp: "Gases expand to fill any container shape and size." }
      ],
      8: [
        { q: "What represents a completely neutral pH value?", choices: ["0", "7", "14", "1"], correct: 1, exp: "A pH of 7 is completely neutral (e.g., pure water)." }
      ],
      10: [
        { q: "Which of the following describes a solution with a pH of 3?", choices: ["Strongly acidic", "Weakly acidic", "Neutral", "Strongly basic"], correct: 0, exp: "A pH below 7 is acidic. The lower the pH, the stronger the acid; pH 3 is strongly acidic." },
        { q: "In the balanced combustion of propane (C₃H₈ + 5 O₂ -> 3 CO₂ + 4 H₂O), how many moles of Oxygen are consumed per mole of Propane?", choices: ["5", "3", "4", "8"], correct: 0, exp: "The coefficient in front of O₂ is 5, meaning 5 moles of oxygen are required to react with 1 mole of propane." },
        { q: "What is the name of the chemical bond where electrons are transferred from a metal to a non-metal?", choices: ["Ionic bond", "Covalent bond", "Hydrogen bond", "Metallic bond"], correct: 0, exp: "Ionic bonds are formed by the electrostatic attraction between oppositely charged ions, formed by electron transfer." },
        { q: "What is the atomic mass of Helium (He), which has 2 protons and 2 neutrons?", choices: ["4 amu", "2 amu", "8 amu", "6 amu"], correct: 0, exp: "Atomic mass is the sum of protons and neutrons: 2 + 2 = 4 atomic mass units (amu)." }
      ]
    },
    phys: {
      4: [
        { q: "What pulls a magnet to refrigerator doors?", choices: ["Gravity", "Friction", "Magnetism", "Wind"], correct: 2, exp: "Magnetism is the force that pulls magnetic metals together." }
      ],
      6: [
        { q: "How can you make a simple nail electromagnet stronger?", choices: ["Wrap more coils of wire around the nail", "Use a wooden nail instead of iron", "Disconnect the battery source", "Keep the wire completely straight"], correct: 0, exp: "More coils increases the magnetic field strength generated." },
        { q: "In a series circuit with three light bulbs, what happens if one bulb burns out?", choices: ["The other two bulbs get brighter", "All three bulbs go out", "Only the burned-out bulb turns off", "The circuit starts charging"], correct: 1, exp: "A series circuit flows in one path; burning out breaks the loop (open circuit)." },
        { q: "Which surface would generate the MOST friction force to slow down a sliding toy cart?", choices: ["A smooth sheet of ice", "A polished wooden floor", "A rough sheet of sandpaper", "A glass table top"], correct: 2, exp: "Sandpaper has a rough texture that creates high friction contact." }
      ],
      8: [
        { q: "How much force is required to accelerate a 2 kg block at 5 m/s²?", choices: ["10 N", "7 N", "3 N", "2.5 N"], correct: 0, exp: "F = ma = 2kg * 5 m/s² = 10 Newtons." }
      ],
      10: [
        { q: "How much net force is required to accelerate a 15 kg object at a rate of 3 m/s²?", choices: ["45 N", "5 N", "18 N", "30 N"], correct: 0, exp: "Using Force = Mass * Acceleration (F = ma): 15 kg * 3 m/s² = 45 Newtons." },
        { q: "How much work is done when a force of 50 N pushes a crate a distance of 8 meters?", choices: ["400 Joules", "200 Joules", "58 Joules", "6.25 Joules"], correct: 0, exp: "Work = Force * Distance = 50 N * 8 m = 400 Joules." },
        { q: "Which type of mechanical wave moves particles perpendicular to the direction the wave travels?", choices: ["Transverse wave", "Longitudinal wave", "Sound wave", "Pressure wave"], correct: 0, exp: "Transverse waves vibrate perpendicular to wave propagation (like light or string waves). Longitudinal waves vibrate parallel (like sound)." },
        { q: "What is the acceleration due to gravity on Earth (approximately)?", choices: ["9.8 m/s²", "5.5 m/s²", "12.0 m/s²", "1.5 m/s²"], correct: 0, exp: "Gravitational acceleration on Earth's surface is approximately 9.8 meters per second squared." }
      ]
    }
  };

  const mapGrade = (grade) => {
    const val = parseInt(grade);
    if (val <= 5) return 4;
    if (val <= 7) return 6;
    if (val <= 9) return 8;
    return 10;
  };

  const generateProceduralQuestion = (grade, subject) => {
    grade = parseInt(grade);
    
    if (subject === 'math') {
      if (grade <= 5) {
        const a = Math.floor(Math.random() * 8) + 6;
        const b = Math.floor(Math.random() * 12) + 6;
        const ans = a * b;
        const wrong1 = ans + Math.floor(Math.random() * 4) + 1;
        const wrong2 = ans - Math.floor(Math.random() * 4) - 1;
        const wrong3 = a * (b + 1);
        const choices = shuffleArray([ans, wrong1, wrong2, wrong3]);
        
        return {
          q: `Calculate: ${a} × ${b}.`,
          choices: choices.map(String),
          correct: choices.indexOf(ans),
          exp: `${a} multiplied by ${b} equals ${ans}.`
        };
      } else if (grade <= 7) {
        const x = Math.floor(Math.random() * 8) + 2;
        const coef = Math.floor(Math.random() * 4) + 2;
        const rhs = coef * x;
        const ans = x;
        const choices = shuffleArray([ans, ans + 2, ans - 1, ans * 2]);
        
        return {
          q: `Solve for x: ${coef}x = ${rhs}.`,
          choices: choices.map(String),
          correct: choices.indexOf(ans),
          exp: `Divide both sides by ${coef}: x = ${rhs} / ${coef} = ${ans}.`
        };
      } else {
        const x = Math.floor(Math.random() * 8) + 2;
        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = a * x + b;
        const ans = x;
        const choices = shuffleArray([ans, ans + 1, ans - 2, Math.floor(c / a)]);
        
        return {
          q: `Solve for x in the equation: ${a}x + ${b} = ${c}.`,
          choices: choices.map(String),
          correct: choices.indexOf(ans),
          exp: `Subtract ${b} from both sides: ${a}x = ${c - b}. Then divide by ${a}: x = ${ans}.`
        };
      }
    } else if (subject === 'phys') {
      if (grade >= 7) {
        const speed = Math.floor(Math.random() * 5) * 10 + 50;
        const time = Math.floor(Math.random() * 3) + 2;
        const dist = speed * time;
        
        const ans = dist;
        const choices = shuffleArray([ans, speed + time, Math.round(speed / time), ans + 25]);
        
        return {
          q: `A train travels at a constant speed of ${speed} km/h for ${time} hours. How far does the train travel?`,
          choices: choices.map(c => `${c} km`),
          correct: choices.indexOf(ans),
          exp: `Distance = Speed × Time = ${speed} km/h × ${time} h = ${dist} km.`
        };
      }
    } else if (subject === 'chem') {
      if (grade >= 8) {
        const elements = [
          { name: "Hydrogen", sym: "H", num: 1 },
          { name: "Helium", sym: "He", num: 2 },
          { name: "Carbon", sym: "C", num: 6 },
          { name: "Oxygen", sym: "O", num: 8 },
          { name: "Sodium", sym: "Na", num: 11 }
        ];
        const el = elements[Math.floor(Math.random() * elements.length)];
        const ans = el.num;
        const choices = shuffleArray([ans, ans + 2, Math.max(1, ans - 3), ans + 5]);
        
        return {
          q: `What is the atomic number of the chemical element ${el.name} (${el.sym})?`,
          choices: choices.map(String),
          correct: choices.indexOf(ans),
          exp: `The atomic number represents the number of protons. ${el.name} has ${el.num} protons.`
        };
      }
    }
    
    return null;
  };

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const getQuestion = (grade, subject, isRescue = false, isBoss = false) => {
    const mapped = mapGrade(grade);

    if (isRescue) {
      // Pick from rescue questions database
      const list = rescueQuestions[subject][mapped] || rescueQuestions[subject][6];
      const item = list[Math.floor(Math.random() * list.length)];
      
      const indices = [0, 1, 2, 3];
      const shuffledIndices = shuffleArray(indices);
      const choices = shuffledIndices.map(idx => item.choices[idx]);
      const correctIdx = shuffledIndices.indexOf(item.correct);
      
      return {
        q: `⚠️ RESCUE QUESTION: ${item.q}`,
        choices: choices,
        correct: correctIdx,
        exp: item.exp
      };
    }

    if (isBoss) {
      // Pick from boss questions database
      const list = bossQuestions[subject][mapped] || bossQuestions[subject][6];
      const item = list[Math.floor(Math.random() * list.length)];
      
      const indices = [0, 1, 2, 3];
      const shuffledIndices = shuffleArray(indices);
      const choices = shuffledIndices.map(idx => item.choices[idx]);
      const correctIdx = shuffledIndices.indexOf(item.correct);
      
      return {
        q: `👑 BOSS CHALLENGE: ${item.q}`,
        choices: choices,
        correct: correctIdx,
        exp: item.exp
      };
    }

    // Force Grade 6 questions to select from bank randomly (bypass procedural math/phys)
    if (parseInt(grade) === 6) {
      const list = questionBank[subject][6];
      const item = list[Math.floor(Math.random() * list.length)];
      
      const indices = [0, 1, 2, 3];
      const shuffledIndices = shuffleArray(indices);
      const choices = shuffledIndices.map(idx => item.choices[idx]);
      const correctIdx = shuffledIndices.indexOf(item.correct);
      
      return {
        q: item.q,
        choices: choices,
        correct: correctIdx,
        exp: item.exp
      };
    }

    if (Math.random() < 0.45) {
      const proc = generateProceduralQuestion(grade, subject);
      if (proc) return proc;
    }

    const list = questionBank[subject][mapped];
    const item = list[Math.floor(Math.random() * list.length)];
    
    const indices = [0, 1, 2, 3];
    const shuffledIndices = shuffleArray(indices);
    const choices = shuffledIndices.map(idx => item.choices[idx]);
    const correctIdx = shuffledIndices.indexOf(item.correct);
    
    return {
      q: item.q,
      choices: choices,
      correct: correctIdx,
      exp: item.exp
    };
  };

  return {
    getQuestion
  };
})();

window.QuestionEngine = QuestionEngine;
