/* ==========================================================================
   KNOWLEDGE QUEST - QUESTION ENGINE
   STEM Database, Rescue Questions, & Procedural Generators
   Ontario Curriculum Aligned (Grades 4-10, with full Grade 7 & 8 Bank)
   ========================================================================== */

const QuestionEngine = (() => {

  // Static question bank for normal battle spells
  const questionBank = {
    math: {
      4: [
        { q: "Subtract the fractions: 5/8 - 2/8.", choices: ["1/8", "3/8", "7/8", "1/2"], correct: 1, exp: "Since denominators are the same, subtract numerators: 5 - 2 = 3. So, the answer is 3/8." },
        { q: "What is the perimeter of a rectangle with length 8 cm and width 5 cm?", choices: ["13 cm", "26 cm", "40 cm", "30 cm"], correct: 1, exp: "Perimeter = 2 * (length + width) = 2 * (8 + 5) = 2 * 13 = 26 cm." }
      ],
      5: [
        { q: "What is 4.5 + 3.75?", choices: ["8.25", "7.80", "8.15", "7.25"], correct: 0, exp: "4.50 + 3.75 = 8.25." },
        { q: "What is the area of a rectangle with length 9 cm and width 6 cm?", choices: ["54 cm²", "30 cm²", "15 cm²", "45 cm²"], correct: 0, exp: "Area = Length × Width = 9 × 6 = 54 cm²." }
      ],
      6: [
        { q: "Simplify the ratio 18:24 to its lowest terms.", choices: ["9:12", "6:8", "3:4", "2:3"], correct: 2, exp: "Divide both sides by their Greatest Common Divisor, which is 6. 18/6 = 3 and 24/6 = 4. Ratio is 3:4." },
        { q: "Find the area of a triangle with a base of 10 cm and a height of 6 cm.", choices: ["60 cm²", "30 cm²", "16 cm²", "20 cm²"], correct: 1, exp: "Area of a triangle = (Base * Height) / 2 = (10 * 6) / 2 = 30 cm²." },
        { q: "What is 25% of 80?", choices: ["15", "20", "25", "40"], correct: 1, exp: "25% is equal to 1/4. 80 / 4 = 20." },
        { q: "Solve for y in the equation: y - 15 = 32.", choices: ["17", "47", "42", "37"], correct: 1, exp: "Add 15 to both sides: y = 32 + 15 = 47." },
        { q: "What is the greatest common factor (GCF) of 24 and 36?", choices: ["6", "8", "12", "18"], correct: 2, exp: "The factors of 24 are 1, 2, 3, 4, 6, 8, 12, 24. The factors of 36 are 1, 2, 3, 4, 6, 9, 12, 18, 36. The highest common one is 12." }
      ],
      7: [
        { q: "[Ontario Grade 7] Calculate: (-8) + (-5).", choices: ["-13", "-3", "13", "3"], correct: 0, exp: "Adding two negative numbers yields a negative sum: -8 + (-5) = -13." },
        { q: "[Ontario Grade 7] Solve for x: 3x + 4 = 19.", choices: ["x = 5", "x = 4", "x = 6", "x = 7"], correct: 0, exp: "Subtract 4 from both sides: 3x = 15. Divide by 3: x = 5." },
        { q: "[Ontario Grade 7] What is the area of a parallelogram with a base of 12 cm and a height of 7 cm?", choices: ["84 cm²", "42 cm²", "38 cm²", "96 cm²"], correct: 0, exp: "Area of a parallelogram = Base × Height = 12 × 7 = 84 cm²." },
        { q: "[Ontario Grade 7] Find the mean (average) of these values: 14, 18, 22, and 26.", choices: ["20", "18", "22", "16"], correct: 0, exp: "Sum = 80. Divide by 4: 80 / 4 = 20." },
        { q: "[Ontario Grade 7] What is 35% written as both a decimal and a simplified fraction?", choices: ["0.35 and 7/20", "3.5 and 7/10", "0.35 and 3/5", "0.035 and 7/20"], correct: 0, exp: "35% = 0.35 = 35/100 = 7/20." },
        { q: "[Ontario Grade 7] Two angles are complementary. If one angle is 38°, what is the other angle?", choices: ["52°", "142°", "62°", "42°"], correct: 0, exp: "Complementary angles sum to 90°. 90° - 38° = 52°." },
        { q: "[Ontario Grade 7] Calculate: 3/4 + 2/5.", choices: ["23/20 (1 3/20)", "5/9", "11/20", "1 1/2"], correct: 0, exp: "Common denominator is 20: 15/20 + 8/20 = 23/20 = 1 3/20." }
      ],
      8: [
        { q: "[Ontario Grade 8] What is the square root of 144?", choices: ["12", "14", "16", "72"], correct: 0, exp: "12 × 12 = 144, so √144 = 12." },
        { q: "[Ontario Grade 8] Using the Pythagorean Theorem (a² + b² = c²), find the hypotenuse of a right triangle with legs of 9 cm and 12 cm.", choices: ["15 cm", "21 cm", "18 cm", "13 cm"], correct: 0, exp: "9² + 12² = 81 + 144 = 225. √225 = 15 cm." },
        { q: "[Ontario Grade 8] Solve for x: 5x - 7 = 3x + 9.", choices: ["x = 8", "x = 4", "x = 16", "x = 2"], correct: 0, exp: "Subtract 3x: 2x - 7 = 9. Add 7: 2x = 16. Divide by 2: x = 8." },
        { q: "[Ontario Grade 8] What is the volume of a cylinder with radius r = 3 cm and height h = 10 cm? (V = π r² h, π ≈ 3.14)", choices: ["282.6 cm³", "94.2 cm³", "188.4 cm³", "300 cm³"], correct: 0, exp: "V = 3.14 × (3)² × 10 = 3.14 × 9 × 10 = 282.6 cm³." },
        { q: "[Ontario Grade 8] Calculate: (-4) × (-6) + (-8).", choices: ["16", "-32", "32", "-16"], correct: 0, exp: "BEDMAS: (-4) × (-6) = +24. 24 + (-8) = 16." },
        { q: "[Ontario Grade 8] Write 0.00045 in scientific notation.", choices: ["4.5 × 10⁻⁴", "4.5 × 10⁴", "45 × 10⁻⁵", "0.45 × 10⁻³"], correct: 0, exp: "Move decimal 4 places right: 4.5 × 10⁻⁴." },
        { q: "[Ontario Grade 8] What is the surface area of a cube with edge length s = 5 cm?", choices: ["150 cm²", "125 cm²", "100 cm²", "75 cm²"], correct: 0, exp: "Cube has 6 square faces. SA = 6 × (5²) = 6 × 25 = 150 cm²." }
      ],
      9: [
        { q: "What is the slope of the line given by the equation y = -3x + 8?", choices: ["8", "3", "-3", "-8"], correct: 2, exp: "In y = mx + b, m is the slope. In y = -3x + 8, the slope is -3." },
        { q: "A right triangle has legs of lengths 6 cm and 8 cm. What is the length of its hypotenuse?", choices: ["10 cm", "14 cm", "48 cm", "12 cm"], correct: 0, exp: "a² + b² = c². 6² + 8² = 36 + 64 = 100. √100 = 10 cm." }
      ],
      10: [
        { q: "Solve for x in the quadratic equation: x² - 5x + 6 = 0.", choices: ["x = 1 or 6", "x = 2 or 3", "x = -2 or -3", "x = 5 or 6"], correct: 1, exp: "Factoring the equation gives (x - 2)(x - 3) = 0. Therefore, x = 2 or x = 3." },
        { q: "What is the value of log₂ (64)?", choices: ["4", "5", "6", "8"], correct: 2, exp: "Since 2⁶ = 64, log₂(64) = 6." }
      ]
    },

    bio: {
      4: [
        { q: "Which part of the plant absorbs water and minerals from the soil?", choices: ["Leaves", "Roots", "Stems", "Flowers"], correct: 1, exp: "Roots anchor the plant and absorb water and essential minerals from the ground." },
        { q: "What is the primary process plants use to make their own food using sunlight?", choices: ["Respiration", "Photosynthesis", "Pollination", "Transpiration"], correct: 1, exp: "Photosynthesis converts sunlight, carbon dioxide, and water into glucose." }
      ],
      5: [
        { q: "Which organ system allows humans to digest food and absorb nutrients?", choices: ["Digestive", "Respiratory", "Nervous", "Skeletal"], correct: 0, exp: "The digestive system breaks down food into nutrients." }
      ],
      6: [
        { q: "Which cell organelle acts as the control center, containing DNA?", choices: ["Mitochondria", "Nucleus", "Ribosome", "Vacuole"], correct: 1, exp: "The nucleus holds the cell's genetic blueprints (DNA) and coordinates cellular functions." },
        { q: "What is an organism that makes its own food using sunlight called?", choices: ["Producer", "Consumer", "Decomposer", "Herbivore"], correct: 0, exp: "Organisms that make their own nutrients via photosynthesis are called producers." },
        { q: "Which green pigment in plant cells absorbs light energy for photosynthesis?", choices: ["Cytoplasm", "Chlorophyll", "Cellulose", "Carotene"], correct: 1, exp: "Chlorophyll captures sunlight inside chloroplasts." },
        { q: "What is the basic unit of structure and function in all living organisms?", choices: ["Atom", "Molecule", "Cell", "Organ"], correct: 2, exp: "Cells are the fundamental unit of life." },
        { q: "Which body system is responsible for pumping blood and delivering oxygen?", choices: ["Respiratory", "Digestive", "Circulatory", "Nervous"], correct: 2, exp: "The circulatory system consists of the heart and blood vessels." }
      ],
      7: [
        { q: "[Ontario Grade 7] Which of the following is an ABIOTIC factor in a forest ecosystem?", choices: ["Sunlight", "Oak tree", "Earthworm", "Bacteria"], correct: 0, exp: "Abiotic factors are non-living physical components, such as sunlight, temperature, water, and soil." },
        { q: "[Ontario Grade 7] Which cellular organelle, present in plant cells but absent in animal cells, provides structural rigidity?", choices: ["Cell wall", "Cell membrane", "Mitochondria", "Ribosome"], correct: 0, exp: "The cell wall (made of cellulose) surrounds plant cells to give them shape and rigidity." },
        { q: "[Ontario Grade 7] In a food web, what percentage of energy is typically passed from one trophic level to the next?", choices: ["10%", "50%", "90%", "25%"], correct: 0, exp: "Only ~10% of energy transfers to the next level; 90% is lost as heat." },
        { q: "[Ontario Grade 7] What process causes water molecules to move across a semi-permeable membrane from high to low concentration?", choices: ["Osmosis", "Diffusion", "Active transport", "Photosynthesis"], correct: 0, exp: "Osmosis is the passive diffusion of water through a semi-permeable membrane." },
        { q: "[Ontario Grade 7] Organisms that break down dead organic matter and return nutrients to the soil are called:", choices: ["Decomposers", "Producers", "Primary consumers", "Herbivores"], correct: 0, exp: "Decomposers (fungi, bacteria, earthworms) break down organic waste into soil nutrients." },
        { q: "[Ontario Grade 7] What is bioaccumulation?", choices: ["Build-up of toxic substances in an organism over time", "Increase in population size", "Growth of plant leaves", "Storage of water in vacuoles"], correct: 0, exp: "Bioaccumulation occurs when toxins build up in an organism faster than they can be excreted." },
        { q: "[Ontario Grade 7] Which organelle is the gel-like fluid holding all cellular components in place?", choices: ["Cytoplasm", "Nucleus", "Vacuole", "Chloroplast"], correct: 0, exp: "Cytoplasm is the jelly-like fluid suspending organelles." }
      ],
      8: [
        { q: "[Ontario Grade 8] Which organ system is responsible for taking in oxygen and expelling carbon dioxide?", choices: ["Respiratory System", "Circulatory System", "Digestive System", "Nervous System"], correct: 0, exp: "The respiratory system (lungs, trachea, bronchi) handles gas exchange." },
        { q: "[Ontario Grade 8] What specialized blood cells carry oxygen using hemoglobin?", choices: ["Red Blood Cells (Erythrocytes)", "White Blood Cells", "Platelets", "Plasma"], correct: 0, exp: "Red blood cells contain hemoglobin to transport oxygen." },
        { q: "[Ontario Grade 8] Which organ system filters waste products from blood and regulates fluid balance?", choices: ["Excretory (Urinary) System", "Digestive System", "Endocrine System", "Lymphatic System"], correct: 0, exp: "The excretory system (kidneys, ureters, bladder) filters metabolic waste." },
        { q: "[Ontario Grade 8] What is the chemical formula equation for Cellular Respiration?", choices: ["Glucose + Oxygen → Carbon Dioxide + Water + ATP", "Carbon Dioxide + Water + Light → Glucose + Oxygen", "Glucose → Lactic Acid + Energy", "Water + Oxygen → Glucose"], correct: 0, exp: "Cellular respiration breaks down glucose with oxygen to yield CO₂, H₂O, and ATP energy." },
        { q: "[Ontario Grade 8] The wave-like muscular contractions pushing food down the esophagus are called:", choices: ["Peristalsis", "Diffusion", "Osmosis", "Circulation"], correct: 0, exp: "Peristalsis pushes food down the digestive tract." },
        { q: "[Ontario Grade 8] Tiny air sacs in lungs where gas exchange with blood capillaries occurs are called:", choices: ["Alveoli", "Bronchioles", "Villi", "Nephrons"], correct: 0, exp: "Alveoli provide high surface area for oxygen and CO₂ gas exchange." },
        { q: "[Ontario Grade 8] Which system coordinates rapid electrical signaling throughout the body via neurons?", choices: ["Nervous System", "Endocrine System", "Musculoskeletal System", "Circulatory System"], correct: 0, exp: "The nervous system transmits electrical nerve impulses." }
      ],
      9: [
        { q: "If a homozygous dominant tall pea plant (TT) is crossed with a homozygous recessive short plant (tt), what percentage of offspring will be tall?", choices: ["25%", "50%", "75%", "100%"], correct: 3, exp: "All offspring inherit Tt. Since tall is dominant, 100% will be tall." },
        { q: "Which molecule stores the genetic blueprint of an organism?", choices: ["RNA", "DNA", "Protein", "Lipid"], correct: 1, exp: "DNA carries genetic instructions for all living organisms." }
      ],
      10: [
        { q: "Which phase of mitosis involves chromosomes lining up along the middle cell plate?", choices: ["Prophase", "Metaphase", "Anaphase", "Telophase"], correct: 1, exp: "In Metaphase, chromosomes align along the equator before being pulled apart." },
        { q: "What is the primary product of cellular respiration used as cellular fuel?", choices: ["Glucose", "Carbon Dioxide", "ATP", "Oxygen"], correct: 2, exp: "Cellular respiration converts biochemical energy from nutrients into ATP." }
      ]
    },

    chem: {
      4: [
        { q: "Which state of matter has a fixed volume but takes the shape of its container?", choices: ["Solid", "Liquid", "Gas", "Plasma"], correct: 1, exp: "Liquids flow to match container shape but retain constant volume." },
        { q: "What happens when liquid water is heated to 100°C (212°F)?", choices: ["It freezes", "It condenses", "It evaporates/boils into gas", "It dissolves"], correct: 2, exp: "Water reaches its boiling point at 100°C and turns to gas." }
      ],
      5: [
        { q: "Which tool measures temperature?", choices: ["Thermometer", "Barometer", "Scale", "Ruler"], correct: 0, exp: "A thermometer measures temperature." }
      ],
      6: [
        { q: "What is the atomic symbol for the element Oxygen?", choices: ["Ox", "O", "Og", "Oy"], correct: 1, exp: "Oxygen symbol is 'O'." },
        { q: "Which of the following is a physical change rather than a chemical change?", choices: ["Baking a cake", "Wood burning", "Ice melting", "Iron rusting"], correct: 2, exp: "Melting ice changes physical state, not chemical makeup." },
        { q: "What three primary subatomic particles make up an atom?", choices: ["Protons, Neutrons, Electrons", "Cells, Molecules, Atoms", "Solids, Liquids, Gases", "Acids, Bases, Salts"], correct: 0, exp: "Atoms consist of protons, neutrons, and electrons." },
        { q: "A substance made of two or more different elements chemically bonded together is a:", choices: ["Mixture", "Solution", "Element", "Compound"], correct: 3, exp: "A compound is a chemical union of different elements." },
        { q: "What state of matter has a definite shape and a definite volume?", choices: ["Solid", "Liquid", "Gas", "Plasma"], correct: 0, exp: "Solids maintain shape and volume." }
      ],
      7: [
        { q: "[Ontario Grade 7] According to Particle Theory, what happens to particles when a substance is heated?", choices: ["Particles move faster and spread farther apart", "Particles slow down and contract", "Particles stop moving entirely", "Particles multiply in number"], correct: 0, exp: "Heat increases kinetic energy, causing faster particle movement and expansion." },
        { q: "[Ontario Grade 7] Which of the following is a PURE SUBSTANCE?", choices: ["Distilled water (H₂O)", "Seawater", "Air", "Brass"], correct: 0, exp: "Distilled water contains only one type of particle (H₂O molecules)." },
        { q: "[Ontario Grade 7] A mixture in which you can visibly see different individual components (like salad) is called a:", choices: ["Mechanical (heterogeneous) mixture", "Solution (homogeneous mixture)", "Element", "Pure compound"], correct: 0, exp: "Heterogeneous mixtures have distinct visible components." },
        { q: "[Ontario Grade 7] When no more solute can dissolve in a liquid at a given temperature, the solution is:", choices: ["Saturated", "Unsaturated", "Dilute", "Concentrated"], correct: 0, exp: "A saturated solution holds the maximum dissolved solute at that temperature." },
        { q: "[Ontario Grade 7] Which method is best suited to separate dissolved salt from water?", choices: ["Evaporation / Distillation", "Filtration", "Magnetism", "Hand sorting"], correct: 0, exp: "Evaporating the liquid leaves solid salt behind." },
        { q: "[Ontario Grade 7] What type of mixture is salt completely dissolved in water?", choices: ["Homogeneous mixture (solution)", "Heterogeneous mixture", "Pure element", "Suspension"], correct: 0, exp: "A solution is homogeneous because solute is uniformly distributed." },
        { q: "[Ontario Grade 7] What property allows iron filings to be separated from sand?", choices: ["Magnetism", "Solubility", "Boiling point", "Particle size"], correct: 0, exp: "Iron is magnetic, allowing a magnet to separate it." }
      ],
      8: [
        { q: "[Ontario Grade 8] What is the formula to calculate the density (ρ) of a substance?", choices: ["Density = Mass / Volume (d = m / V)", "Density = Mass × Volume", "Density = Volume / Mass", "Density = Force × Area"], correct: 0, exp: "Density measures mass per unit volume (d = m/V)." },
        { q: "[Ontario Grade 8] Viscosity is defined as a fluid's:", choices: ["Resistance to flow", "Ability to dissolve in water", "Mass per unit area", "Boiling point"], correct: 0, exp: "Viscosity is internal friction resisting fluid flow." },
        { q: "[Ontario Grade 8] A solid block has a mass of 120 grams and a volume of 40 cm³. What is its density?", choices: ["3 g/cm³", "0.33 g/cm³", "4800 g/cm³", "80 g/cm³"], correct: 0, exp: "Density = Mass / Volume = 120g / 40cm³ = 3 g/cm³." },
        { q: "[Ontario Grade 8] According to Archimedes' Principle, buoyant force on a submerged object equals:", choices: ["The weight of the fluid displaced by the object", "The total mass of the object", "The surface area of the fluid", "Zero"], correct: 0, exp: "Buoyant force equals the weight of the displaced fluid." },
        { q: "[Ontario Grade 8] How does heating a LIQUID usually affect its viscosity?", choices: ["Decreases viscosity (flows faster)", "Increases viscosity (flows slower)", "Has no effect on viscosity", "Turns it into a solid"], correct: 0, exp: "Heating liquids gives particles energy to overcome attraction, lowering viscosity." },
        { q: "[Ontario Grade 8] Hydraulic systems use pressurized fluids to do work based on Pascal's Law, stating:", choices: ["Pressure applied to an enclosed fluid is transmitted equally in all directions", "Fluids cannot be pushed", "Pressure decreases when force increases", "Gases compress more than liquids"], correct: 0, exp: "Pascal's Law governs hydraulic systems: pressure is transmitted uniformly." },
        { q: "[Ontario Grade 8] An object will FLOAT in water if its average density is:", choices: ["Less than 1.0 g/cm³ (density of water)", "Greater than 1.0 g/cm³", "Equal to 10 g/cm³", "Zero"], correct: 0, exp: "Objects less dense than water (1.0 g/cm³) float." }
      ],
      9: [
        { q: "What is the chemical formula for table salt?", choices: ["HCl", "NaOH", "NaCl", "NaHCO₃"], correct: 2, exp: "Table salt is Sodium Chloride (NaCl)." },
        { q: "What pH value represents a completely neutral substance, such as pure water?", choices: ["0", "1", "7", "14"], correct: 2, exp: "pH 7 represents neutral." }
      ],
      10: [
        { q: "Which type of chemical bond involves the sharing of electron pairs between atoms?", choices: ["Ionic bond", "Covalent bond", "Hydrogen bond", "Metallic bond"], correct: 1, exp: "Covalent bonding involves electron pair sharing." },
        { q: "Balance the chemical equation: C₃H₈ + X O₂ -> 3 CO₂ + 4 H₂O. What is X?", choices: ["3", "4", "5", "6"], correct: 2, exp: "Right side has 10 O atoms. We need 5 O₂ molecules (X = 5)." }
      ]
    },

    phys: {
      4: [
        { q: "Which force pulls objects downward toward the center of the Earth?", choices: ["Magnetism", "Gravity", "Friction", "Air Resistance"], correct: 1, exp: "Gravity draws physical mass toward Earth's center." },
        { q: "Which simple machine consists of a grooved wheel and rope used to lift heavy loads?", choices: ["Lever", "Inclined Plane", "Pulley", "Screw"], correct: 2, exp: "A pulley uses a wheel and rope system to lift objects." }
      ],
      5: [
        { q: "What form of energy comes from movement?", choices: ["Kinetic energy", "Potential energy", "Chemical energy", "Nuclear energy"], correct: 0, exp: "Kinetic energy is energy of motion." }
      ],
      6: [
        { q: "Which force opposes motion when two surfaces slide against each other?", choices: ["Gravity", "Friction", "Magnetism", "Inertia"], correct: 1, exp: "Friction resists relative movement between sliding surfaces." },
        { q: "A roller coaster parked at the top of a hill has mostly what type of energy?", choices: ["Kinetic energy", "Potential energy", "Thermal energy", "Sound energy"], correct: 1, exp: "An object positioned at height stores gravitational potential energy." },
        { q: "What is the standard unit of measurement for force?", choices: ["Joule", "Watt", "Newton", "Volt"], correct: 2, exp: "Force is measured in Newtons (N)." },
        { q: "Which simple machine is a flat, slanted surface used to move heavy loads upward?", choices: ["Lever", "Pulley", "Inclined plane", "Wedge"], correct: 2, exp: "An inclined plane reduces force needed to raise objects." },
        { q: "If you increase the mass of an object, what happens to the gravitational pull acting on it?", choices: ["It decreases", "It increases", "It stays the same", "It drops to zero"], correct: 1, exp: "Gravitational force is directly proportional to mass." }
      ],
      7: [
        { q: "[Ontario Grade 7] Which internal force acts to STRETCH or pull a structural material apart?", choices: ["Tension", "Compression", "Torsion", "Shear"], correct: 0, exp: "Tension pulls structural members apart." },
        { q: "[Ontario Grade 7] Cars driving across a bridge represent what type of load?", choices: ["Live load", "Dead load", "Dynamic wind force", "Torsional load"], correct: 0, exp: "Live loads are temporary or moving forces acting on a structure." },
        { q: "[Ontario Grade 7] Heat transfer through direct contact between solids is called:", choices: ["Conduction", "Convection", "Radiation", "Insulation"], correct: 0, exp: "Conduction occurs when vibrating particles transfer heat through direct contact." },
        { q: "[Ontario Grade 7] Why does a hot air balloon rise?", choices: ["Heated air expands, becomes less dense than surrounding cool air, and creates upthrust", "Hot air is heavier", "Conduction pushes it up", "Gravity pulls hot air upward"], correct: 0, exp: "Thermal expansion decreases air density, creating buoyant convection." },
        { q: "[Ontario Grade 7] Which structural shape is known as the strongest for distributing loads in bridges?", choices: ["Triangle", "Square", "Rectangle", "Circle"], correct: 0, exp: "Triangles cannot deform without changing side lengths, making them rigid." },
        { q: "[Ontario Grade 7] Dark, dull surfaces are excellent at:", choices: ["Absorbing and emitting radiant thermal energy", "Reflecting solar radiation", "Conducting electricity only", "Resisting heat transfer"], correct: 0, exp: "Dark matt objects absorb and emit thermal radiation best." },
        { q: "[Ontario Grade 7] Which internal force acts to TWIST a material?", choices: ["Torsion", "Shear", "Compression", "Tension"], correct: 0, exp: "Torsion is the twisting force created by opposite turning forces." }
      ],
      8: [
        { q: "[Ontario Grade 8] According to the Law of Reflection, the angle of incidence is always:", choices: ["Equal to the angle of reflection", "Greater than the angle of reflection", "90 degrees minus reflection angle", "Double the reflection angle"], correct: 0, exp: "The Law of Reflection states θ_i = θ_r." },
        { q: "[Ontario Grade 8] What causes a straw placed in a glass of water to look bent?", choices: ["Refraction (bending of light as it changes speed between air and water)", "Reflection off the glass", "Absorption of light by water", "Diffraction"], correct: 0, exp: "Refraction occurs because light travels slower in water than in air." },
        { q: "[Ontario Grade 8] What is the Mechanical Advantage (MA) of a lever if 20 N input lifts 100 N output load?", choices: ["5", "2000", "0.2", "80"], correct: 0, exp: "Mechanical Advantage = Output Force / Input Force = 100 N / 20 N = 5." },
        { q: "[Ontario Grade 8] How much Work is done when a force of 40 N moves a crate 6 metres?", choices: ["240 Joules", "6.6 Joules", "46 Joules", "140 Joules"], correct: 0, exp: "Work = Force × Distance = 40 N × 6 m = 240 Joules." },
        { q: "[Ontario Grade 8] A curved mirror bulging OUTWARD toward the viewer (like a car side mirror) is a:", choices: ["Convex mirror", "Concave mirror", "Plane mirror", "Prism"], correct: 0, exp: "Convex mirrors curve outward, providing a wider field of view." },
        { q: "[Ontario Grade 8] A machine receives 500 J input work and delivers 400 J useful output work. What is its efficiency?", choices: ["80%", "125%", "90%", "20%"], correct: 0, exp: "Efficiency = (400 / 500) × 100% = 80%." },
        { q: "[Ontario Grade 8] Which type of lens is thicker in the middle and CONVERGES parallel light rays to a focal point?", choices: ["Convex lens (converging)", "Concave lens (diverging)", "Flat glass window", "Prism"], correct: 0, exp: "Convex lenses bend incoming parallel light rays inward toward a focal point." }
      ],
      9: [
        { q: "What states that 'for every action, there is an equal and opposite reaction'?", choices: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Law of Gravity"], correct: 2, exp: "Newton's Third Law states forces occur in equal and opposite pairs." },
        { q: "How much force is required to accelerate a 5 kg mass at 4 m/s²?", choices: ["9 Newtons", "20 Newtons", "1.25 Newtons", "45 Newtons"], correct: 1, exp: "F = ma: 5 kg * 4 m/s² = 20 Newtons." }
      ],
      10: [
        { q: "What is Ohm's Law formula relating Voltage (V), Current (I), and Resistance (R)?", choices: ["V = I / R", "V = I * R", "I = V * R", "R = V * I"], correct: 1, exp: "Ohm's Law: V = IR." },
        { q: "Which type of wave requires a physical medium to travel through?", choices: ["Sound wave", "Light wave", "Radio wave", "X-ray"], correct: 0, exp: "Sound is a mechanical wave requiring a physical medium." }
      ]
    }
  };

  // Rescue Questions database
  const rescueQuestions = {
    math: {
      4: [{ q: "Calculate: 15 + 24.", choices: ["39", "29", "49", "35"], correct: 0, exp: "15 + 24 = 39." }],
      5: [{ q: "Calculate: 12 × 5.", choices: ["60", "50", "70", "55"], correct: 0, exp: "12 × 5 = 60." }],
      6: [
        { q: "A potion bag contains 3 red potions and 6 blue potions. What is the simplified ratio of red to blue?", choices: ["1:2", "2:1", "1:3", "3:1"], correct: 0, exp: "3:6 simplifies to 1:2." },
        { q: "If a creature has 80 Max HP and health drops to 50%, how much HP remains?", choices: ["40 HP", "30 HP", "50 HP", "60 HP"], correct: 0, exp: "50% of 80 = 40 HP." }
      ],
      7: [
        { q: "[Ontario Grade 7] Calculate: (-12) - (-7).", choices: ["-5", "-19", "5", "19"], correct: 0, exp: "Subtracting a negative is adding a positive: -12 + 7 = -5." },
        { q: "[Ontario Grade 7] A recipe requires a ratio of 2 cups flour to 3 cups sugar. How much flour for 9 cups sugar?", choices: ["6 cups", "4 cups", "8 cups", "5 cups"], correct: 0, exp: "2:3 = x:9. Multiply by 3: 2 × 3 = 6 cups flour." },
        { q: "[Ontario Grade 7] Volume of a rectangular prism with length 6 cm, width 4 cm, height 5 cm?", choices: ["120 cm³", "74 cm³", "60 cm³", "100 cm³"], correct: 0, exp: "V = 6 × 4 × 5 = 120 cm³." }
      ],
      8: [
        { q: "[Ontario Grade 8] Evaluate: √81 + √49.", choices: ["16", "130", "15", "14"], correct: 0, exp: "√81 = 9 and √49 = 7. 9 + 7 = 16." },
        { q: "[Ontario Grade 8] What is the slope (m) of the line y = -2x + 7?", choices: ["-2", "7", "2", "-7"], correct: 0, exp: "In y = mx + b, slope m = -2." },
        { q: "[Ontario Grade 8] Probability of drawing 2 red marbles in a row with replacement from a bag with 4 red and 6 blue?", choices: ["4/25 (16%)", "2/5 (40%)", "6/25 (24%)", "1/5 (20%)"], correct: 0, exp: "(4/10) × (4/10) = 16/100 = 4/25." }
      ],
      9: [{ q: "Calculate the average of 12, 16, and 20.", choices: ["16", "15", "18", "14"], correct: 0, exp: "(12 + 16 + 20) / 3 = 16." }],
      10: [{ q: "Solve for x in: x + y = 10 and 2x - y = 8.", choices: ["x = 6, y = 4", "x = 5, y = 5", "x = 4, y = 6", "x = 7, y = 3"], correct: 0, exp: "3x = 18 => x = 6, y = 4." }]
    },
    bio: {
      4: [{ q: "What part of a tree performs photosynthesis?", choices: ["Leaves", "Roots", "Trunk", "Bark"], correct: 0, exp: "Leaves contain chlorophyll." }],
      5: [{ q: "What do herbivores eat?", choices: ["Plants only", "Meat only", "Both", "Insects"], correct: 0, exp: "Herbivores eat plants." }],
      6: [{ q: "Which animal is an invertebrate (no backbone)?", choices: ["Butterfly", "Frog", "Eagle", "Snake"], correct: 0, exp: "Butterflies are insects with exosomes." }],
      7: [
        { q: "[Ontario Grade 7] Which describes primary ecological succession?", choices: ["Plant growth starting on bare rock after a glacier recedes", "Regrowth of a forest after a wildfire", "Growth of crops in a farmland", "Seasonal leaf shedding"], correct: 0, exp: "Primary succession starts on bare rock with no pre-existing soil." },
        { q: "[Ontario Grade 7] What two organelles are in plant cells but NOT animal cells?", choices: ["Cell wall and Chloroplasts", "Nucleus and Mitochondria", "Ribosomes and Cell membrane", "Vacuole and Cytoplasm"], correct: 0, exp: "Plant cells uniquely possess cell wall and chloroplasts." }
      ],
      8: [
        { q: "[Ontario Grade 8] What is the main function of platelets in the blood?", choices: ["Forming blood clots to prevent bleeding", "Fighting off viral infections", "Carrying oxygen", "Pumping blood"], correct: 0, exp: "Platelets aggregate to form blood clots." },
        { q: "[Ontario Grade 8] Microscopic finger-like projections lining the small intestine that absorb nutrients are:", choices: ["Villi", "Alveoli", "Nephrons", "Cilia"], correct: 0, exp: "Villi maximize intestinal absorption surface area." }
      ],
      9: [{ q: "Which cell organelle is the powerhouse of the cell?", choices: ["Mitochondria", "Nucleus", "Ribosome", "Vacuole"], correct: 0, exp: "Mitochondria produce ATP." }],
      10: [{ q: "If DNA has 30% Adenine, what % Cytosine does it contain?", choices: ["20%", "30%", "15%", "40%"], correct: 0, exp: "A(30%) + T(30%) = 60%. Remaining 40% is split equally between G and C (20% each)." }]
    },
    chem: {
      4: [{ q: "What state of matter is steam?", choices: ["Gas", "Liquid", "Solid", "Plasma"], correct: 0, exp: "Steam is water vapor (gas)." }],
      5: [{ q: "What is water when frozen?", choices: ["Ice", "Steam", "Gas", "Lava"], correct: 0, exp: "Frozen water is solid ice." }],
      6: [{ q: "Which of the following is a physical change?", choices: ["Crushing an aluminum can", "Baking bread", "Rusting iron", "Burning wood"], correct: 0, exp: "Crushing changes shape only." }],
      7: [
        { q: "[Ontario Grade 7] What is a solute in a solution?", choices: ["The substance that is dissolved (e.g. sugar)", "The liquid doing the dissolving (e.g. water)", "The undissolved residue", "The gas produced"], correct: 0, exp: "The solute is dissolved in the solvent." },
        { q: "[Ontario Grade 7] Muddy water is an example of a suspension because:", choices: ["Particles settle to the bottom over time if left undisturbed", "It is a pure element", "The mud dissolves completely", "It cannot be filtered"], correct: 0, exp: "Suspensions settle out over time." }
      ],
      8: [
        { q: "[Ontario Grade 8] Why are hydraulic systems (using liquids) preferred over pneumatic systems for heavy lifting?", choices: ["Liquids are virtually incompressible, transmitting force efficiently", "Gases are heavier", "Liquids evaporate instantly", "Gases freeze under pressure"], correct: 0, exp: "Incompressible liquids transmit force directly." },
        { q: "[Ontario Grade 8] What unit is standard for measuring fluid pressure?", choices: ["Pascal (Pa) or N/m²", "Joule (J)", "Watt (W)", "Newton (N)"], correct: 0, exp: "Pressure is Force per area (Pa = N/m²)." }
      ],
      9: [{ q: "What is the atomic symbol for Helium?", choices: ["He", "H", "Hl", "Hm"], correct: 0, exp: "Helium is He." }],
      10: [{ q: "What is the pH of a solution with [H+] = 1.0 x 10^-5 M?", choices: ["pH = 5", "pH = -5", "pH = 7", "pH = 9"], correct: 0, exp: "pH = -log[H+] = 5." }]
    },
    phys: {
      4: [{ q: "What force pulls a thrown ball back to Earth?", choices: ["Gravity", "Friction", "Magnetism", "Wind"], correct: 0, exp: "Gravity pulls objects to Earth." }],
      5: [{ q: "What produces sound?", choices: ["Vibrations", "Light", "Heat", "Gravity"], correct: 0, exp: "Sound is caused by vibrating matter." }],
      6: [{ q: "Which material is an excellent conductor of electricity?", choices: ["Copper wire", "Rubber eraser", "Wooden stick", "Plastic spoon"], correct: 0, exp: "Metals like copper conduct electricity." }],
      7: [
        { q: "[Ontario Grade 7] What is the center of gravity of a structure?", choices: ["The point where total weight is balanced", "The highest roof point", "The underground foundation", "The heaviest corner"], correct: 0, exp: "Center of gravity is the balance point." },
        { q: "[Ontario Grade 7] How does double-pane glass window insulation reduce heat loss?", choices: ["Trapped air/gas acts as a poor thermal conductor (good insulator)", "Glass generates heat", "Glass absorbs dark light", "It stops gravity"], correct: 0, exp: "Trapped gas minimizes conductive heat loss." }
      ],
      8: [
        { q: "[Ontario Grade 8] Why can no real machine be 100% efficient?", choices: ["Some energy is always lost as wasted heat due to friction", "Energy is destroyed", "Gravity stops machines", "Light slows down"], correct: 0, exp: "Friction converts mechanical work into wasted thermal energy." },
        { q: "[Ontario Grade 8] White light passing through a glass prism separates into colors because of:", choices: ["Dispersion (wavelengths refract at slightly different angles)", "Reflection", "Polarization", "Interference"], correct: 0, exp: "Dispersion separates white light by wavelength refraction." }
      ],
      9: [{ q: "What is the standard unit of force?", choices: ["Newton", "Joule", "Watt", "Volt"], correct: 0, exp: "Force is measured in Newtons (N)." }],
      10: [{ q: "A 15 N force moves an object 4 metres. How much Work is done?", choices: ["60 Joules", "3.75 J", "19 J", "120 J"], correct: 0, exp: "Work = F × d = 15 × 4 = 60 J." }]
    }
  };

  // Harder Boss Questions database
  const bossQuestions = {
    math: {
      4: [{ q: "What is 12 times 11?", choices: ["132", "122", "142", "121"], correct: 0, exp: "12 * 11 = 132." }],
      5: [{ q: "What is 144 divided by 12?", choices: ["12", "14", "11", "16"], correct: 0, exp: "144 / 12 = 12." }],
      6: [{ q: "A triangular field has base 12 m and height 8 m. What is its area?", choices: ["48 m²", "96 m²", "20 m²", "36 m²"], correct: 0, exp: "Area = (12 * 8) / 2 = 48 m²." }],
      7: [
        { q: "[Ontario Grade 7] Solve for y: 4(y - 3) = 28.", choices: ["y = 10", "y = 7", "y = 8", "y = 11"], correct: 0, exp: "y - 3 = 7 => y = 10." },
        { q: "[Ontario Grade 7] A spinner has 8 equal sections (1 to 8). What is the probability of spinning a prime number?", choices: ["1/2 (50%)", "3/8 (37.5%)", "1/4 (25%)", "5/8 (62.5%)"], correct: 0, exp: "Primes: 2, 3, 5, 7 (4 out of 8 = 1/2)." },
        { q: "[Ontario Grade 7] Item costs $80, discounted by 20%. Final sale price before tax?", choices: ["$64", "$60", "$70", "$68"], correct: 0, exp: "Discount = $16 => $80 - $16 = $64." }
      ],
      8: [
        { q: "[Ontario Grade 8] Solve for x: 2(4x - 3) = 5(x + 3).", choices: ["x = 7", "x = 5", "x = 9", "x = 3"], correct: 0, exp: "8x - 6 = 5x + 15 => 3x = 21 => x = 7." },
        { q: "[Ontario Grade 8] A right triangular prism has base triangle 6 cm by 8 cm and height 15 cm. Total volume?", choices: ["360 cm³", "720 cm³", "180 cm³", "240 cm³"], correct: 0, exp: "Base Area = 24. Volume = 24 × 15 = 360 cm³." }
      ],
      9: [{ q: "Solve for x: 3x - 5 = 16.", choices: ["7", "6", "8", "9"], correct: 0, exp: "3x = 21 => x = 7." }],
      10: [{ q: "Solve for x in: 3(x - 4) = 2x + 5.", choices: ["x = 17", "x = 9", "x = 1", "x = 7"], correct: 0, exp: "3x - 12 = 2x + 5 => x = 17." }]
    },
    bio: {
      4: [{ q: "Which class of animals have fur and nurse their young?", choices: ["Mammals", "Birds", "Reptiles", "Fish"], correct: 0, exp: "Mammals have fur and nurse young." }],
      5: [{ q: "What organ pumps blood?", choices: ["Heart", "Lungs", "Liver", "Brain"], correct: 0, exp: "The heart pumps blood." }],
      6: [{ q: "Which class of vertebrates has gills, scales, and is cold-blooded?", choices: ["Fish", "Amphibians", "Reptiles", "Mammals"], correct: 0, exp: "Fish use gills and have scales." }],
      7: [
        { q: "[Ontario Grade 7] A plant cell is placed in concentrated salt water. What happens?", choices: ["Water leaves the cell via osmosis, causing plasmolysis (shrinkage)", "Water enters and bursts cell", "Salt enters nucleus", "Nothing"], correct: 0, exp: "Osmosis draws water out toward higher solute concentration." },
        { q: "[Ontario Grade 7] In food chain Phytoplankton → Zooplankton → Minnow → Trout → Osprey, who is the TERTIARY consumer?", choices: ["Trout", "Minnow", "Zooplankton", "Osprey"], correct: 0, exp: "Phytoplankton(P) → Zooplankton(1st) → Minnow(2nd) → Trout(3rd/Tertiary)." }
      ],
      8: [
        { q: "[Ontario Grade 8] During intense exercise, how do circulatory and respiratory systems work together?", choices: ["Lungs supply more O₂ to blood while heart pumps faster to deliver O₂ to muscles", "Heart stops", "Lungs absorb blood", "Kidneys replace lungs"], correct: 0, exp: "Lungs increase O₂ intake while heart speeds transport." },
        { q: "[Ontario Grade 8] Which heart chamber receives oxygenated blood directly from the lungs?", choices: ["Left Atrium", "Right Atrium", "Right Ventricle", "Left Ventricle"], correct: 0, exp: "Pulmonary veins return oxygenated blood to the Left Atrium." }
      ],
      9: [{ q: "What molecule stores genetic code?", choices: ["DNA", "RNA", "Protein", "Lipid"], correct: 0, exp: "DNA carries genetic blueprints." }],
      10: [{ q: "During which process is glucose broken down with oxygen to release ATP?", choices: ["Aerobic Respiration", "Photosynthesis", "Fermentation", "Transpiration"], correct: 0, exp: "Aerobic respiration breaks down glucose for ATP." }]
    },
    chem: {
      4: [{ q: "What element has the symbol O?", choices: ["Oxygen", "Gold", "Iron", "Carbon"], correct: 0, exp: "O = Oxygen." }],
      5: [{ q: "What is water's state at room temperature?", choices: ["Liquid", "Solid", "Gas", "Plasma"], correct: 0, exp: "Water is liquid at room temperature." }],
      6: [{ q: "Which of these is a chemical change?", choices: ["A rusty chain forming on a gate", "Dissolving sugar", "Chopping wood", "Melting wax"], correct: 0, exp: "Rusting creates iron oxide." }],
      7: [
        { q: "[Ontario Grade 7] Adding 50g sugar to 100mL water dissolves completely. 10g more settles at bottom. What was initial state?", choices: ["Unsaturated solution", "Saturated solution", "Supersaturated solution", "Pure compound"], correct: 0, exp: "It could hold more solute initially, so it was unsaturated." },
        { q: "[Ontario Grade 7] Why can coffee filters separate grounds from coffee but not dissolved sugar from water?", choices: ["Dissolved sugar particles are much smaller than filter pores, while coffee grounds are larger", "Filter absorbs sugar", "Grounds are magnetic", "Sugar is liquid"], correct: 0, exp: "Filtration separates by particle size." }
      ],
      8: [
        { q: "[Ontario Grade 8] 500 N force applied to a hydraulic piston of area 0.05 m². What pressure is exerted?", choices: ["10,000 Pa (10 kPa)", "25 Pa", "2,500 Pa", "500 Pa"], correct: 0, exp: "P = F / A = 500 N / 0.05 m² = 10,000 Pa." },
        { q: "[Ontario Grade 8] Crown weighs 50 N in air, 45 N submerged in water. Buoyant force?", choices: ["5 N", "95 N", "45 N", "10 N"], correct: 0, exp: "Buoyant force = 50 N - 45 N = 5 N." }
      ],
      9: [{ q: "What represents a completely neutral pH?", choices: ["7", "0", "14", "1"], correct: 0, exp: "pH 7 is neutral." }],
      10: [{ q: "Which describes a solution with pH of 3?", choices: ["Strongly acidic", "Weakly acidic", "Neutral", "Strongly basic"], correct: 0, exp: "pH 3 is strongly acidic." }]
    },
    phys: {
      4: [{ q: "What pulls a magnet to refrigerator doors?", choices: ["Magnetism", "Gravity", "Friction", "Wind"], correct: 0, exp: "Magnetism attracts magnetic metals." }],
      5: [{ q: "What color absorbs the most sunlight?", choices: ["Black", "White", "Yellow", "Clear"], correct: 0, exp: "Black absorbs light." }],
      6: [{ q: "How can you make a nail electromagnet stronger?", choices: ["Wrap more wire coils around the nail", "Use wooden nail", "Disconnect battery", "Keep wire straight"], correct: 0, exp: "More coils increase magnetic field strength." }],
      7: [
        { q: "[Ontario Grade 7] Scissors cutting cardboard demonstrate which internal force?", choices: ["Shear force", "Torsion force", "Tension force", "Compressive force"], correct: 0, exp: "Shear force cuts/slides along parallel planes." },
        { q: "[Ontario Grade 7] Thermal expansion in railway tracks on hot days happens because:", choices: ["Particles gain kinetic energy, vibrate faster, and push farther apart", "New particles are created", "Tracks absorb water", "Gravity pulls tracks"], correct: 0, exp: "Thermal energy increases particle vibration amplitude." }
      ],
      8: [
        { q: "[Ontario Grade 8] Inclined plane ramp is 12 m long and 3 m high. Ideal Mechanical Advantage (IMA)?", choices: ["4", "36", "0.25", "15"], correct: 0, exp: "IMA = Length / Height = 12 / 3 = 4." },
        { q: "[Ontario Grade 8] Light travels from air into a dense glass block. What happens?", choices: ["Light slows down and bends TOWARD the normal line", "Light speeds up and bends away", "Light stops", "Light reflects without entering"], correct: 0, exp: "Denser medium slows light down, bending ray toward normal." }
      ],
      9: [{ q: "How much force is required to accelerate 2 kg at 5 m/s²?", choices: ["10 N", "7 N", "3 N", "2.5 N"], correct: 0, exp: "F = ma = 2 * 5 = 10 N." }],
      10: [{ q: "What is acceleration due to gravity on Earth?", choices: ["9.8 m/s²", "5.5 m/s²", "12.0 m/s²", "1.5 m/s²"], correct: 0, exp: "g ≈ 9.8 m/s²." }]
    }
  };

  const mapGrade = (grade) => {
    const val = parseInt(grade);
    if (!isNaN(val) && val >= 4 && val <= 10) {
      return val;
    }
    return 8;
  };

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const generateProceduralQuestion = (grade, subject) => {
    grade = parseInt(grade) || 8;

    if (subject === 'math') {
      if (grade === 7) {
        // Grade 7 Integer Addition / Linear Equation / Parallelogram
        const type = Math.floor(Math.random() * 3);
        if (type === 0) {
          const a = -1 * (Math.floor(Math.random() * 15) + 3);
          const b = Math.floor(Math.random() * 20) - 10;
          const ans = a + b;
          const choices = shuffleArray([ans, ans + 3, ans - 4, -ans]);
          return {
            q: `[Ontario Grade 7] Calculate: (${a}) + (${b}).`,
            choices: choices.map(String),
            correct: choices.indexOf(ans),
            exp: `Adding ${a} and ${b} equals ${ans}.`
          };
        } else if (type === 1) {
          const x = Math.floor(Math.random() * 10) + 2;
          const coef = Math.floor(Math.random() * 4) + 2;
          const constVal = Math.floor(Math.random() * 10) + 1;
          const rhs = coef * x + constVal;
          const ans = x;
          const choices = shuffleArray([ans, ans + 2, Math.max(1, ans - 1), ans + 4]);
          return {
            q: `[Ontario Grade 7] Solve for x in the equation: ${coef}x + ${constVal} = ${rhs}.`,
            choices: choices.map(String),
            correct: choices.indexOf(ans),
            exp: `Subtract ${constVal} from both sides: ${coef}x = ${rhs - constVal}. Divide by ${coef}: x = ${ans}.`
          };
        } else {
          const base = Math.floor(Math.random() * 8) + 6;
          const height = Math.floor(Math.random() * 6) + 4;
          const ans = base * height;
          const choices = shuffleArray([ans, Math.floor(ans / 2), ans + 10, ans - 8]);
          return {
            q: `[Ontario Grade 7] What is the area of a parallelogram with base = ${base} cm and height = ${height} cm?`,
            choices: choices.map(c => `${c} cm²`),
            correct: choices.indexOf(ans),
            exp: `Area of parallelogram = Base × Height = ${base} × ${height} = ${ans} cm².`
          };
        }
      } else if (grade === 8) {
        // Grade 8 Pythagorean Theorem / Cylinder Volume / Multi-step Eq
        const type = Math.floor(Math.random() * 3);
        if (type === 0) {
          const triples = [[3,4,5], [6,8,10], [5,12,13], [9,12,15], [8,15,17]];
          const triple = triples[Math.floor(Math.random() * triples.length)];
          const ans = triple[2];
          const choices = shuffleArray([ans, triple[0] + triple[1], ans + 3, Math.max(1, ans - 4)]);
          return {
            q: `[Ontario Grade 8] Using Pythagorean Theorem (a² + b² = c²), find the hypotenuse of a right triangle with legs of ${triple[0]} cm and ${triple[1]} cm.`,
            choices: choices.map(c => `${c} cm`),
            correct: choices.indexOf(ans),
            exp: `${triple[0]}² + ${triple[1]}² = ${triple[0]*triple[0]} + ${triple[1]*triple[1]} = ${ans*ans}. √${ans*ans} = ${ans} cm.`
          };
        } else if (type === 1) {
          const x = Math.floor(Math.random() * 8) + 2;
          const c1 = Math.floor(Math.random() * 3) + 4;
          const c2 = Math.floor(Math.random() * 2) + 1;
          const b1 = Math.floor(Math.random() * 10) + 1;
          const b2 = (c1 - c2) * x - b1;
          const ans = x;
          const choices = shuffleArray([ans, ans + 2, Math.max(1, ans - 1), ans + 5]);
          return {
            q: `[Ontario Grade 8] Solve for x: ${c1}x - ${b1} = ${c2}x + ${b2}.`,
            choices: choices.map(String),
            correct: choices.indexOf(ans),
            exp: `Subtract ${c2}x: ${c1 - c2}x - ${b1} = ${b2}. Add ${b1}: ${c1 - c2}x = ${b2 + b1}. Divide by ${c1 - c2}: x = ${ans}.`
          };
        } else {
          const r = Math.floor(Math.random() * 4) + 2;
          const h = Math.floor(Math.random() * 5) + 5;
          const ans = Math.round(3.14 * r * r * h * 10) / 10;
          const choices = shuffleArray([ans, Math.round(3.14 * r * h * 10) / 10, Math.round(ans * 1.5), Math.round(ans * 0.5)]);
          return {
            q: `[Ontario Grade 8] What is the volume of a cylinder with radius r = ${r} cm and height h = ${h} cm? (V = π r² h, π ≈ 3.14)`,
            choices: choices.map(c => `${c} cm³`),
            correct: choices.indexOf(ans),
            exp: `V = 3.14 × (${r}²) × ${h} = 3.14 × ${r*r} × ${h} = ${ans} cm³.`
          };
        }
      }
    } else if (subject === 'chem') {
      if (grade === 8) {
        const mass = (Math.floor(Math.random() * 10) + 2) * 20;
        const vol = (Math.floor(Math.random() * 5) + 2) * 10;
        const ans = Math.round((mass / vol) * 100) / 100;
        const choices = shuffleArray([ans, Math.round((vol / mass) * 100) / 100, ans + 2, Math.max(0.1, ans - 1)]);
        return {
          q: `[Ontario Grade 8] Calculate the density of an object with mass = ${mass} g and volume = ${vol} cm³. (d = m / V)`,
          choices: choices.map(c => `${c} g/cm³`),
          correct: choices.indexOf(ans),
          exp: `Density = Mass / Volume = ${mass}g / ${vol}cm³ = ${ans} g/cm³.`
        };
      }
    } else if (subject === 'phys') {
      if (grade === 8) {
        const force = (Math.floor(Math.random() * 8) + 2) * 10;
        const dist = Math.floor(Math.random() * 8) + 2;
        const ans = force * dist;
        const choices = shuffleArray([ans, force + dist, Math.round(force / dist), ans + 50]);
        return {
          q: `[Ontario Grade 8] How much Work is done when a force of ${force} N pushes a load for a distance of ${dist} metres? (W = F × d)`,
          choices: choices.map(c => `${c} Joules`),
          correct: choices.indexOf(ans),
          exp: `Work = Force × Distance = ${force} N × ${dist} m = ${ans} Joules.`
        };
      }
    }

    return null;
  };

  const getQuestion = (grade, subject, isRescue = false, isBoss = false) => {
    const mapped = mapGrade(grade);

    if (isRescue) {
      const list = (rescueQuestions[subject] && rescueQuestions[subject][mapped]) 
        || (rescueQuestions[subject] && rescueQuestions[subject][8]) 
        || rescueQuestions[subject][6];
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
      const list = (bossQuestions[subject] && bossQuestions[subject][mapped]) 
        || (bossQuestions[subject] && bossQuestions[subject][8]) 
        || bossQuestions[subject][6];
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

    // 40% chance of procedural question generator if available
    if (Math.random() < 0.40) {
      const proc = generateProceduralQuestion(mapped, subject);
      if (proc) return proc;
    }

    // Pick directly from current grade's question pool
    const list = (questionBank[subject] && questionBank[subject][mapped]) 
      || (questionBank[subject] && questionBank[subject][8]) 
      || questionBank[subject][6];
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
