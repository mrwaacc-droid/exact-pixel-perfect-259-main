import type { CourseSourceType } from "@/lib/types";

type KingpinLessonSection = {
    title: string;
    purpose: string;
    content: string[];
};

type KingpinLesson = {
    id: string;
    title: string;
    durationMinutes: number;
    objective: string;
    tools: string[];
    departments: string[];
    roles: string[];
    outcomes: string[];
    sections: KingpinLessonSection[];
};

type KingpinModule = {
    id: string;
    title: string;
    overview: string;
    tools: string[];
    departments: string[];
    roles: string[];
    outcomes: string[];
    lessons: KingpinLesson[];
};

type KingpinCertificateTheme = {
    brandName: string;
    tagline: string;
    logoUrl: string;
    website: string;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    sealText: string;
    signatureLabel: string;
};

type KingpinCourse = {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    owner: string;
    sourceType: CourseSourceType;
    visibility: "public_catalog" | "platform_admin_only";
    priceUsd: number;
    pricingLabel: string;
    description: string;
    heroDescription: string;
    audience: string[];
    departments: string[];
    roles: string[];
    toolUniverse: string[];
    includedResources: string[];
    assessmentModel: string[];
    outcomes: string[];
    certificateTheme: KingpinCertificateTheme;
    modules: KingpinModule[];
};

type LessonSeed = {
    title: string;
    objective: string;
};

type WeekSeed = {
    week: number;
    theme: string;
    competencyFocus: string;
    relevance: string;
    lessons: LessonSeed[];
};

type TermSeed = {
    id: string;
    title: string;
    overview: string;
    outcomes: string[];
    weeks: WeekSeed[];
};

const GRADE9_MATH_TOOLS = [
    "Klassruum Whiteboard",
    "Worked Examples",
    "Guided Practice",
    "Independent Practice",
    "Exit Ticket",
    "Correction Clinic",
    "Math Journal",
];

const GRADE9_MATH_DEPARTMENTS = ["Junior School Mathematics", "Curriculum Design", "Learning Support"];
const GRADE9_MATH_ROLES = [
    "Grade 9 Learner",
    "Mathematics Teacher",
    "Head of Department",
    "Parent or Guardian",
];

const GRADE9_MATH_CERTIFICATE_THEME: KingpinCertificateTheme = {
    brandName: "KingPin",
    tagline: "Curriculum-aligned digital learning pathways for structured classroom delivery",
    logoUrl: "https://kingpin.co.ke/images/kingpin-logo-512x512.png",
    website: "https://kingpin.co.ke",
    primaryColor: "#191314",
    accentColor: "#7D2233",
    backgroundColor: "#FBF8F5",
    sealText: "KingPin CBC Mathematics Learning Record",
    signatureLabel: "KingPin Curriculum & Learning Systems Office",
};

function lesson(title: string, objective: string): LessonSeed {
    return { title, objective };
}

function week(
    weekNumber: number,
    theme: string,
    competencyFocus: string,
    relevance: string,
    lessons: LessonSeed[],
): WeekSeed {
    return {
        week: weekNumber,
        theme,
        competencyFocus,
        relevance,
        lessons,
    };
}

function lessonId(termId: string, weekNumber: number, lessonNumber: number) {
    const weekPart = String(weekNumber).padStart(2, "0");
    const lessonPart = String(lessonNumber).padStart(2, "0");
    return `cbc-g9-math-${termId}-w${weekPart}-l${lessonPart}`;
}

function makeMathematicsLesson(term: TermSeed, weekSeed: WeekSeed, seed: LessonSeed, index: number): KingpinLesson {
    const positionLabel = `Term ${term.id.replace("term", "")} · Week ${weekSeed.week} · Lesson ${index + 1}`;

    return {
        id: lessonId(term.id, weekSeed.week, index + 1),
        title: seed.title,
        durationMinutes: 45,
        objective: seed.objective,
        tools: GRADE9_MATH_TOOLS,
        departments: GRADE9_MATH_DEPARTMENTS,
        roles: GRADE9_MATH_ROLES,
        outcomes: [...term.outcomes, weekSeed.competencyFocus, seed.objective],
        sections: [
            {
                title: "Why this lesson matters",
                purpose: "Connect the mathematics to the learner's lived world and to the wider Grade 9 course journey.",
                content: [
                    `${positionLabel} sits inside the weekly focus on ${weekSeed.theme}.`,
                    `This lesson matters because ${weekSeed.relevance}`,
                    `The specific lesson objective is: ${seed.objective}`,
                ],
            },
            {
                title: "Teacher modelling and mathematical thinking",
                purpose: "Show the worked method, the mathematical language, and the reasoning steps learners are expected to imitate.",
                content: [
                    `The teacher models the concept using the whiteboard, explicit worked examples, and short think-aloud explanations tied to ${weekSeed.theme.toLowerCase()}.`,
                    "Vocabulary, symbols, units, and layout conventions are introduced carefully so learners can speak, read, and write the mathematics correctly.",
                    "Common misconceptions are surfaced early and contrasted with correct reasoning before independent work begins.",
                ],
            },
            {
                title: "Guided practice and questioning",
                purpose: "Move learners from watching to active participation through scaffolded examples and short checks for understanding.",
                content: [
                    `Learners answer oral and written prompts that gradually build toward ${seed.objective}.`,
                    "The teacher pauses for mini-checkpoints, asks learners to justify steps, and uses correction moments to reinforce accuracy and confidence.",
                    `Guided examples are chosen so that the weekly competency focus — ${weekSeed.competencyFocus} — is continuously reinforced.`,
                ],
            },
            {
                title: "Independent application",
                purpose: "Build fluency, transfer, and confidence through individual and pair-based problem solving.",
                content: [
                    `Learners complete short independent tasks directly linked to ${seed.title.toLowerCase()}.`,
                    "Questions should move from routine practice to simple application so that learners do not stop at memorising a method.",
                    `Where possible, tasks connect back to the weekly relevance statement: ${weekSeed.relevance}`,
                ],
            },
            {
                title: "Reflection, correction, and evidence of learning",
                purpose: "Close the lesson with visible evidence of mastery and identify what needs reteaching or revision.",
                content: [
                    "Learners review answers, correct one misconception, and record the key method in their math journal or notebook.",
                    "The teacher uses an exit ticket, short oral quiz, or worked correction to determine whether the class is ready for the next lesson.",
                    "Any gaps identified here should shape the opening retrieval task of the next lesson.",
                ],
            },
        ],
    };
}

function makeMathematicsTermModule(term: TermSeed): KingpinModule {
    const lessons = term.weeks.flatMap((weekSeed) =>
        weekSeed.lessons.map((seed, index) => makeMathematicsLesson(term, weekSeed, seed, index)),
    );

    return {
        id: term.id,
        title: term.title,
        overview: term.overview,
        tools: GRADE9_MATH_TOOLS,
        departments: GRADE9_MATH_DEPARTMENTS,
        roles: GRADE9_MATH_ROLES,
        outcomes: term.outcomes,
        lessons,
    };
}

const grade9MathematicsTermSeeds: TermSeed[] = [
    {
        id: "term1",
        title: "Term 1 — Number, Ratio, Algebra Foundations, and Geometry Basics",
        overview:
            "Term 1 builds the fluency and reasoning base needed for the rest of Grade 9 Mathematics. It moves learners from number operations into algebraic representation, early equation solving, coordinate thinking, and angle relationships through carefully sequenced 45-minute lessons.",
        outcomes: [
            "Work confidently with integers, rational numbers, percentages, and proportional reasoning.",
            "Represent mathematical situations using expressions, formulae, and simple equations.",
            "Recognise, describe, and continue patterns and sequences.",
            "Use coordinates and angle relationships accurately in simple geometric contexts.",
        ],
        weeks: [
            week(
                1,
                "Diagnostic number sense, integers, and rational numbers",
                "Strengthen signed number reasoning and connect classroom mathematics to quantitative everyday language.",
                "signed numbers appear in temperature change, banking, debt, elevation, and directed movement",
                [
                    lesson("Diagnostic Review of Number Operations", "Identify strengths and gaps in prior knowledge on whole-number and fraction operations."),
                    lesson("Integers on the Number Line", "Represent positive and negative integers accurately and compare their values."),
                    lesson("Operations with Integers", "Add, subtract, multiply, and divide integers using correct sign rules and reasoning."),
                    lesson("Rational Numbers in Context", "Interpret rational numbers in practical contexts such as temperature, balances, and movement."),
                ],
            ),
            week(
                2,
                "Fractions, decimals, and percentages",
                "Move smoothly between fraction, decimal, and percentage forms and apply them in practical settings.",
                "discounts, marks, interest, recipes, and financial records often require switching between these forms",
                [
                    lesson("Equivalent Fractions and Simplification", "Generate equivalent fractions and simplify fractions correctly."),
                    lesson("Operations with Decimals", "Perform the four operations on decimals with place-value accuracy."),
                    lesson("Percentages as Fractions and Decimals", "Convert between percentages, fractions, and decimals accurately."),
                    lesson("Applying Percentages", "Solve everyday problems involving percentages such as discounts, increase, and decrease."),
                ],
            ),
            week(
                3,
                "Ratio, rate, and proportion",
                "Use proportional reasoning to compare quantities and solve multi-step everyday problems.",
                "learners meet ratio ideas in maps, recipes, transport cost, speed, and resource sharing",
                [
                    lesson("Understanding Ratios", "Express and simplify ratios in words, symbols, and real situations."),
                    lesson("Rates and Unit Rates", "Interpret and calculate rates and unit rates from given information."),
                    lesson("Direct Proportion", "Recognise direct proportion relationships and solve related problems."),
                    lesson("Problem Solving with Proportion", "Use ratio and proportion strategies to solve routine and applied problems."),
                ],
            ),
            week(
                4,
                "Indices, roots, and number patterns",
                "Recognise structure in repeated multiplication, roots, and simple sequences to prepare for algebraic reasoning.",
                "patterns, growth, and compact notation are essential in science, finance, coding, and data interpretation",
                [
                    lesson("Squares and Square Roots", "Find squares and square roots of numbers and explain their inverse relationship."),
                    lesson("Cubes and Cube Roots", "Determine cubes and cube roots in simple numerical situations."),
                    lesson("Introduction to Indices", "Use index notation correctly and apply simple laws of indices."),
                    lesson("Recognising Number Patterns", "Identify and describe arithmetic patterns from lists, tables, and visual prompts."),
                ],
            ),
            week(
                5,
                "Algebraic language and expressions",
                "Translate verbal mathematical statements into symbolic form and simplify basic algebraic expressions.",
                "algebra helps learners describe general rules instead of repeating many separate arithmetic cases",
                [
                    lesson("Variables, Constants, and Terms", "Distinguish variables, constants, coefficients, and terms in expressions."),
                    lesson("Writing Algebraic Expressions", "Translate words and simple situations into algebraic expressions."),
                    lesson("Collecting Like Terms", "Simplify algebraic expressions by grouping and combining like terms."),
                    lesson("Expanding Simple Expressions", "Expand simple bracketed expressions correctly and explain each step."),
                ],
            ),
            week(
                6,
                "Evaluation, substitution, and factorisation basics",
                "Evaluate expressions accurately and begin seeing the structural links between expansion and factorisation.",
                "formula use, spreadsheets, and measurement all depend on substituting values correctly into expressions",
                [
                    lesson("Substitution into Expressions", "Evaluate algebraic expressions correctly by substituting given values."),
                    lesson("Using Formulae in Context", "Apply given formulae to calculate unknown values in measurement and number contexts."),
                    lesson("Introduction to Factorisation", "Recognise simple common factors and write basic expressions in factorised form."),
                    lesson("Expression Review and Mixed Practice", "Solve mixed questions involving simplification, substitution, and basic factorisation."),
                ],
            ),
            week(
                7,
                "Linear equations",
                "Solve one-step and two-step linear equations and interpret solutions in context.",
                "equations model unknown quantities in shopping, transport, planning, and resource allocation",
                [
                    lesson("Meaning of an Equation", "Explain what an equation represents and identify the unknown quantity."),
                    lesson("Solving One-Step Equations", "Solve one-step linear equations using inverse operations."),
                    lesson("Solving Two-Step Equations", "Solve two-step linear equations accurately and justify each transformation."),
                    lesson("Word Problems with Equations", "Form and solve linear equations from short verbal problems."),
                ],
            ),
            week(
                8,
                "Formulae and transposition",
                "Rearrange simple formulae and apply algebraic transposition in mathematical and practical settings.",
                "many formulas in science, geometry, and finance are useful only when learners can change the subject confidently",
                [
                    lesson("Reading and Interpreting Formulae", "Interpret each symbol in a formula and identify the subject."),
                    lesson("Changing the Subject of a Formula I", "Rearrange simple formulae where one operation is required."),
                    lesson("Changing the Subject of a Formula II", "Rearrange formulae that require two algebraic steps."),
                    lesson("Applied Formula Problems", "Use transposed formulae to solve measurement and finance-related questions."),
                ],
            ),
            week(
                9,
                "Sequences and generalisation",
                "Move from recognising patterns to expressing general rules and simple nth-term ideas.",
                "generalisation helps learners describe changing situations efficiently in mathematics and real systems",
                [
                    lesson("Describing Arithmetic Sequences", "Identify the rule behind simple arithmetic sequences."),
                    lesson("Generating Terms from a Rule", "Use a given rule to generate terms in a sequence accurately."),
                    lesson("Finding a General Term", "Write a simple general rule for an arithmetic pattern from its terms."),
                    lesson("Pattern Problems from Tables", "Use tables and pattern data to predict missing or future values."),
                ],
            ),
            week(
                10,
                "Coordinates and introductory graphing",
                "Use the Cartesian plane to plot, read, and interpret points and simple relationships.",
                "coordinates appear in mapping, design, movement, and digital interfaces where position matters",
                [
                    lesson("The Cartesian Plane", "Identify axes, origin, and quadrants on the Cartesian plane."),
                    lesson("Plotting Ordered Pairs", "Plot ordered pairs accurately on a coordinate grid."),
                    lesson("Reading Coordinates from Graphs", "Read and interpret coordinates from plotted points and simple diagrams."),
                    lesson("Coordinate Applications", "Solve simple real-life problems involving location and movement on a grid."),
                ],
            ),
            week(
                11,
                "Lines, angles, and geometric reasoning",
                "Use angle facts and line relationships to solve simple geometric problems accurately.",
                "construction, design, road layouts, and built environments all rely on angle relationships",
                [
                    lesson("Types of Angles and Their Measurement", "Classify and measure angles correctly using accepted terminology."),
                    lesson("Angles on a Straight Line and Around a Point", "Use angle facts on straight lines and at a point to find unknown angles."),
                    lesson("Vertically Opposite and Corresponding Angles", "Apply angle relationships formed by intersecting and parallel lines."),
                ],
            ),
            week(
                12,
                "Term 1 consolidation and assessment",
                "Bring together number, algebra, coordinates, and angle reasoning before the term assessment.",
                "revision helps learners connect topics, correct weak methods, and build confidence for formal assessment",
                [
                    lesson("Revision — Number, Ratio, and Proportion", "Consolidate core skills in signed numbers, percentages, and proportion."),
                    lesson("Revision — Algebra, Patterns, and Coordinates", "Consolidate expression work, equations, patterns, and graph basics."),
                    lesson("Term 1 CAT and Error Analysis", "Demonstrate mastery of Term 1 work and analyse common assessment errors."),
                ],
            ),
        ],
    },
    {
        id: "term2",
        title: "Term 2 — Geometry, Mensuration, Transformations, Statistics, and Probability",
        overview:
            "Term 2 develops visual reasoning, measurement accuracy, transformation thinking, and statistical interpretation. Lessons are designed to move repeatedly between diagram work, explanation, practical application, and assessment so that mathematics remains visible and usable.",
        outcomes: [
            "Reason accurately with the properties of triangles, quadrilaterals, and polygons.",
            "Calculate perimeter, area, circumference, and volume in practical situations.",
            "Use transformations and scale ideas to interpret and create mathematical representations.",
            "Collect, represent, summarise, and interpret data and basic probability situations.",
        ],
        weeks: [
            week(
                1,
                "Triangles and angle properties",
                "Use classification and angle relationships to solve geometric questions involving triangles.",
                "roof trusses, sign frames, supports, and drawn diagrams often rely on triangle properties",
                [
                    lesson("Classifying Triangles", "Classify triangles using side and angle properties."),
                    lesson("Interior Angles of Triangles", "Use the angle sum property of a triangle to determine unknown angles."),
                    lesson("Exterior Angles of Triangles", "Relate exterior angles to opposite interior angles in triangle problems."),
                    lesson("Triangle Problem Solving", "Solve multi-step problems involving triangle properties and angle relationships."),
                ],
            ),
            week(
                2,
                "Quadrilaterals and polygons",
                "Identify polygon properties and use them to solve angle and classification problems.",
                "room layouts, packaging, fencing, and pattern design regularly depend on polygon understanding",
                [
                    lesson("Quadrilateral Properties", "Describe and compare the properties of common quadrilaterals."),
                    lesson("Regular and Irregular Polygons", "Classify polygons and distinguish between regular and irregular forms."),
                    lesson("Interior Angles of Polygons", "Determine interior angle sums and missing interior angles in polygons."),
                    lesson("Exterior Angles of Polygons", "Use exterior angle properties to solve polygon problems."),
                ],
            ),
            week(
                3,
                "Geometric constructions",
                "Use mathematical instruments accurately to construct lines, bisectors, and simple geometric figures.",
                "construction accuracy supports design, engineering drawing, technical work, and mathematical proof habits",
                [
                    lesson("Using Ruler, Compass, and Protractor", "Handle basic construction instruments accurately and safely."),
                    lesson("Constructing Perpendicular and Angle Bisectors", "Construct perpendicular bisectors and angle bisectors accurately."),
                    lesson("Constructing Triangles from Given Data", "Construct triangles from measured conditions such as sides and angles."),
                    lesson("Practical Construction Task", "Complete a short geometric construction task and justify the steps used."),
                ],
            ),
            week(
                4,
                "Perimeter and area of plane figures",
                "Calculate and compare perimeter and area for standard and composite shapes.",
                "tiling, fencing, land measurement, and interior planning all rely on area and perimeter reasoning",
                [
                    lesson("Perimeter of Rectilinear Shapes", "Determine the perimeter of simple and composite plane shapes."),
                    lesson("Area of Rectangles and Triangles", "Calculate the area of rectangles and triangles using correct formulae."),
                    lesson("Area of Composite Shapes", "Find the area of shapes made from two or more simple regions."),
                    lesson("Mensuration in Context", "Solve practical area and perimeter problems from real or simulated contexts."),
                ],
            ),
            week(
                5,
                "Circles",
                "Use circle vocabulary, circumference, and area ideas accurately in routine and applied questions.",
                "wheels, round containers, sports grounds, and circular designs make circle mathematics practical and visible",
                [
                    lesson("Parts of a Circle", "Identify and use the vocabulary of a circle correctly."),
                    lesson("Circumference of a Circle", "Calculate circumference using formulae and measurement relationships."),
                    lesson("Area of a Circle", "Calculate the area of a circle and interpret the result with correct units."),
                    lesson("Circle Applications", "Solve contextual problems involving circumference and area of circles."),
                ],
            ),
            week(
                6,
                "Solids, nets, surface area, and volume",
                "Interpret three-dimensional objects and calculate measures linked to capacity and storage.",
                "packaging, tanks, rooms, and containers require accurate reasoning about 3D shape and volume",
                [
                    lesson("Recognising Common Solids and Nets", "Match common solids to their nets and visible properties."),
                    lesson("Surface Area of Simple Solids", "Calculate surface area of simple prisms and related solids."),
                    lesson("Volume of Prisms and Cylinders", "Calculate the volume of prisms and cylinders correctly."),
                    lesson("Capacity and Real-Life Measurement", "Solve practical problems involving volume, capacity, and unit conversion."),
                ],
            ),
            week(
                7,
                "Reflections, translations, and rotations",
                "Describe and perform basic geometric transformations on the plane.",
                "transformations help learners understand design, movement, symmetry, and spatial reasoning",
                [
                    lesson("Reflection in Lines", "Reflect shapes accurately in horizontal, vertical, and diagonal mirror lines."),
                    lesson("Translations on a Grid", "Translate shapes using vector-like movement descriptions on a grid."),
                    lesson("Rotations About a Point", "Rotate shapes through given angles about a stated centre."),
                    lesson("Comparing Transformations", "Describe the effect of different transformations on a shape and its position."),
                ],
            ),
            week(
                8,
                "Enlargement and scale drawing",
                "Use scale factors and enlargement ideas to interpret and create proportional drawings.",
                "maps, floor plans, diagrams, and technical sketches rely on consistent scale thinking",
                [
                    lesson("Understanding Scale Factor", "Explain scale factor and use it to enlarge or reduce lengths."),
                    lesson("Enlargement on a Grid", "Draw enlarged shapes accurately on a coordinate grid."),
                    lesson("Scale Drawing and Interpretation", "Interpret scale drawings and calculate actual lengths from them."),
                    lesson("Maps, Plans, and Layout Problems", "Solve practical problems involving maps, plans, and simple scaled representations."),
                ],
            ),
            week(
                9,
                "Data collection and representation",
                "Organise raw data and display it using suitable tables and charts.",
                "data displays are used in school records, surveys, elections, weather, and community reports",
                [
                    lesson("Collecting and Classifying Data", "Collect, sort, and classify data for a simple investigation."),
                    lesson("Frequency Tables", "Organise data in clear and accurate frequency tables."),
                    lesson("Bar Graphs and Pictorial Displays", "Represent data using appropriate charts and graphs."),
                    lesson("Interpreting Displayed Data", "Read, compare, and interpret data shown in tables and charts."),
                ],
            ),
            week(
                10,
                "Measures of central tendency and spread",
                "Use summary statistics to describe and compare data sets sensibly.",
                "averages and spread measures help learners interpret performance, trends, and variability in real data",
                [
                    lesson("Mean", "Calculate the arithmetic mean and interpret it in context."),
                    lesson("Median", "Determine the median from ordered and tabulated data sets."),
                    lesson("Mode and Range", "Identify the mode and calculate the range accurately."),
                    lesson("Comparing Data Sets", "Use mean, median, mode, and range to compare simple data sets."),
                ],
            ),
            week(
                11,
                "Probability basics",
                "Reason about chance using everyday language, fractions, and simple experiments.",
                "probability supports better reasoning about fairness, prediction, games, and uncertainty",
                [
                    lesson("Meaning of Probability", "Describe probability as a measure of likelihood from impossible to certain."),
                    lesson("Simple Probability from Outcomes", "Calculate simple probability from equally likely outcomes."),
                    lesson("Experimental Probability", "Compare theoretical expectation and experimental results in simple situations."),
                ],
            ),
            week(
                12,
                "Term 2 consolidation and assessment",
                "Bring together geometry, mensuration, transformations, statistics, and probability for mastery review.",
                "structured revision helps learners identify weak sub-topics before the term assessment and protects confidence",
                [
                    lesson("Revision — Geometry and Mensuration", "Consolidate shape properties, construction, perimeter, area, and volume."),
                    lesson("Revision — Transformations, Data, and Probability", "Consolidate transformations, data handling, and basic probability reasoning."),
                    lesson("Term 2 CAT and Correction Conference", "Demonstrate understanding of Term 2 content and analyse mistakes productively."),
                ],
            ),
        ],
    },
    {
        id: "term3",
        title: "Term 3 — Advanced Algebra, Graphs, Financial Mathematics, and Consolidation",
        overview:
            "Term 3 deepens algebraic reasoning and expands learners' ability to interpret relationships through graphs, inequalities, and practical applications. The term closes by connecting strands through problem-solving, investigations, and mastery-focused review.",
        outcomes: [
            "Solve and interpret inequalities and simultaneous equations.",
            "Represent and interpret relationships using tables, functions, and linear graphs.",
            "Use similarity, Pythagoras' theorem, and financial mathematics in practical contexts.",
            "Bring together multiple strands of mathematics in integrated reasoning and revision tasks.",
        ],
        weeks: [
            week(
                1,
                "Linear inequalities",
                "Extend equation reasoning into inequalities and represent solution sets clearly.",
                "inequalities are used whenever limits, ranges, budgets, and safety bounds matter",
                [
                    lesson("Meaning of Inequalities", "Distinguish an inequality from an equation and interpret inequality symbols correctly."),
                    lesson("Solving One-Step Inequalities", "Solve one-step inequalities using inverse operations."),
                    lesson("Solving Two-Step Inequalities", "Solve two-step inequalities and explain each transformation clearly."),
                    lesson("Number-Line Representation of Solutions", "Represent inequality solution sets accurately on a number line."),
                ],
            ),
            week(
                2,
                "Simultaneous equations",
                "Solve pairs of linear equations and interpret their shared solution in context.",
                "paired conditions arise in planning, pricing, and comparison problems where two unknowns are linked",
                [
                    lesson("Understanding a Pair of Equations", "Explain what a simultaneous equation system represents."),
                    lesson("Solving by Substitution", "Solve simple simultaneous equations using substitution."),
                    lesson("Solving by Elimination", "Solve simple simultaneous equations using elimination."),
                    lesson("Applied Problems with Simultaneous Equations", "Form and solve simultaneous equations from verbal contexts."),
                ],
            ),
            week(
                3,
                "Relations and functions",
                "Recognise input-output structure and describe simple functional relationships.",
                "functions support later graphing, science relationships, and technology-based pattern reasoning",
                [
                    lesson("Relations from Sets and Tables", "Describe a relation using tables, pairs, and mapping language."),
                    lesson("Introduction to Functions", "Recognise a simple function as a consistent input-output rule."),
                    lesson("Generating Outputs from Rules", "Use a rule to determine outputs for given inputs accurately."),
                    lesson("Functions in Context", "Interpret simple function rules in everyday mathematical situations."),
                ],
            ),
            week(
                4,
                "Linear graphs from tables and equations",
                "Build linear graphs systematically from rules, tables, and plotted points.",
                "graphs are used to show patterns and change clearly in school subjects and daily life data",
                [
                    lesson("Creating Tables of Values", "Generate a table of values from a simple linear rule."),
                    lesson("Plotting a Linear Graph", "Plot points accurately and draw a straight-line graph from tabulated data."),
                    lesson("Reading Information from Graphs", "Interpret points, intercepts, and visible trends on a graph."),
                    lesson("Connecting Equation, Table, and Graph", "Relate an algebraic rule to its table and graph representation."),
                ],
            ),
            week(
                5,
                "Gradient and interpretation of change",
                "Interpret gradient informally as a rate of change and use it to compare graphs.",
                "rate of change thinking appears in motion, cost, growth, and trend interpretation",
                [
                    lesson("Meaning of Gradient", "Explain gradient as a measure of steepness or rate of change."),
                    lesson("Comparing Steepness on Graphs", "Compare graphs using visual gradient differences."),
                    lesson("Reading Real-Life Linear Graphs", "Interpret simple distance-time or cost graphs."),
                    lesson("Graph-Based Reasoning", "Answer contextual questions using information from linear graphs."),
                ],
            ),
            week(
                6,
                "Similarity and proportional geometry",
                "Recognise and use similarity ideas to solve proportional geometry problems.",
                "drawings, models, maps, and resized shapes all depend on similarity reasoning",
                [
                    lesson("Recognising Similar Shapes", "Identify pairs of shapes that are similar and justify the decision."),
                    lesson("Using Scale Factors in Similarity", "Use scale factor ideas to compare side lengths in similar shapes."),
                    lesson("Solving Similarity Problems", "Solve basic proportional problems involving similar figures."),
                    lesson("Similarity in Practical Contexts", "Apply similarity to maps, models, and design-style situations."),
                ],
            ),
            week(
                7,
                "Pythagoras' theorem",
                "Use Pythagoras' theorem accurately in right-angled triangle problems.",
                "right-angled measurement appears in construction, layout, distance, navigation, and design work",
                [
                    lesson("Right-Angled Triangles and the Theorem", "State and explain Pythagoras' theorem for right-angled triangles."),
                    lesson("Finding a Missing Side", "Use Pythagoras' theorem to calculate a missing side length."),
                    lesson("Checking Whether a Triangle Is Right-Angled", "Use side lengths to test whether a triangle is right-angled."),
                    lesson("Practical Applications of Pythagoras", "Solve real or simulated measurement problems using Pythagoras' theorem."),
                ],
            ),
            week(
                8,
                "Financial mathematics",
                "Use percentages and arithmetic reasoning in buying, selling, saving, and planning contexts.",
                "financial numeracy helps learners reason about household decisions, entrepreneurship, and personal planning",
                [
                    lesson("Profit and Loss", "Calculate profit, loss, and related values in simple commercial contexts."),
                    lesson("Discount and Commission", "Solve problems involving discounts, mark-ups, and commission."),
                    lesson("Simple Interest", "Calculate simple interest and total amount for a stated period."),
                    lesson("Budgeting and Financial Decisions", "Use arithmetic and percentage reasoning to solve budgeting problems."),
                ],
            ),
            week(
                9,
                "Integrated problem-solving",
                "Connect number, algebra, geometry, and statistics in richer multi-step tasks.",
                "real problems do not arrive by topic label, so learners must choose methods and combine ideas flexibly",
                [
                    lesson("Mixed Number and Algebra Problems", "Solve multi-step problems that combine number operations with algebraic reasoning."),
                    lesson("Mixed Geometry and Measurement Problems", "Use geometry and mensuration together in practical problem solving."),
                    lesson("Mixed Graph and Data Problems", "Interpret graphs and data in linked questions that require more than one step."),
                    lesson("Strategy Selection in Problem Solving", "Explain why a chosen method works in a multi-step mathematics problem."),
                ],
            ),
            week(
                10,
                "Mathematical investigations and communication",
                "Use mathematics to investigate patterns, organise evidence, and communicate findings clearly.",
                "investigations help learners see mathematics as a tool for inquiry rather than only answer production",
                [
                    lesson("Pattern Investigation", "Investigate a numerical or geometric pattern and present a justified conclusion."),
                    lesson("Data Mini-Project", "Collect or organise a small data set and present meaningful findings."),
                    lesson("Applied Measurement Investigation", "Use measurement and reasoning to complete a short applied mathematics investigation."),
                    lesson("Communicating Mathematical Findings", "Present a mathematical solution or investigation clearly using accurate language and layout."),
                ],
            ),
            week(
                11,
                "Final revision by strands",
                "Revisit the year's major strands and identify persistent misconceptions before the final assessment.",
                "focused revision helps learners strengthen weak procedures and organise what they know into larger patterns",
                [
                    lesson("Revision — Number and Algebra", "Consolidate the year's work on number, ratio, expressions, equations, and inequalities."),
                    lesson("Revision — Geometry and Measurement", "Consolidate geometry, mensuration, constructions, transformations, and Pythagoras' theorem."),
                    lesson("Revision — Graphs, Data, and Financial Mathematics", "Consolidate graph interpretation, statistics, probability, and finance-related arithmetic."),
                ],
            ),
            week(
                12,
                "End-of-year assessment and correction",
                "Use assessment evidence to celebrate growth, pinpoint remaining gaps, and prepare for transition into the next learning stage.",
                "assessment becomes meaningful when learners review mistakes, notice progress, and understand what to improve next",
                [
                    lesson("Mock Assessment and Timing Practice", "Apply Grade 9 mathematics knowledge under timed assessment conditions."),
                    lesson("Correction Conference and Reteach Priorities", "Analyse assessment errors and identify the highest-priority concepts for reteaching."),
                    lesson("Final Mastery Reflection", "Summarise the year's mathematical growth and set focused goals for the next phase of learning."),
                ],
            ),
        ],
    },
];

const grade9MathematicsModules = grade9MathematicsTermSeeds.map(makeMathematicsTermModule);

function createGrade9MathematicsCourse(input: {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    heroDescription: string;
    termIds: string[];
}) {
    const modules = grade9MathematicsModules.filter((module) => input.termIds.includes(module.id));
    const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);
    const totalWeeks = grade9MathematicsTermSeeds
        .filter((term) => input.termIds.includes(term.id))
        .reduce((sum, term) => sum + term.weeks.length, 0);
    const totalTerms = modules.length;
    const combinedOutcomes = Array.from(new Set(modules.flatMap((module) => module.outcomes)));

    return {
        id: input.id,
        slug: input.slug,
        title: input.title,
        subtitle: input.subtitle,
        owner: "KingPin Academy",
        sourceType: "kingpin" as CourseSourceType,
        visibility: "platform_admin_only" as const,
        priceUsd: 0,
        pricingLabel: "Licensed by agreement",
        description: input.description,
        heroDescription: input.heroDescription,
        audience: [
            "Grade 9 learners",
            "Junior school mathematics teachers",
            "School leaders overseeing CBC mathematics rollout",
            "Parents or guardians supporting structured home revision",
        ],
        departments: GRADE9_MATH_DEPARTMENTS,
        roles: GRADE9_MATH_ROLES,
        toolUniverse: GRADE9_MATH_TOOLS,
        includedResources: [
            `${totalTerms} term module${totalTerms === 1 ? "" : "s"}`,
            `${totalWeeks} teaching weeks`,
            `${totalLessons} detailed 45-minute lessons`,
            "Worked examples, guided practice, and correction routines",
            "Weekly consolidation and term-end mastery checks",
            "Original Klassruum-ready lesson language aligned to CBC delivery goals",
        ],
        assessmentModel: [
            "Weekly exit-ticket or correction-clinic evidence",
            "Fortnightly practice and homework review",
            "Mid-sequence formative checks on fluency and reasoning",
            "End-term CAT or mastery assessment",
            "Learner notebook reflection and error-analysis routines",
        ],
        outcomes: combinedOutcomes,
        certificateTheme: GRADE9_MATH_CERTIFICATE_THEME,
        modules,
    } satisfies KingpinCourse;
}

export const KINGPIN_CBC_GRADE9_MATHEMATICS_FULL_YEAR = createGrade9MathematicsCourse({
    id: "kingpin-cbc-grade9-mathematics-full-year-001",
    slug: "kenyan-cbc-grade-9-mathematics-full-year",
    title: "Kenyan CBC Grade 9 Mathematics - Full Year",
    subtitle: "Three-term mathematics pathway with 138 structured 45-minute lessons for Junior School",
    description:
        "A complete KingPin-owned Grade 9 Mathematics curriculum pathway organised into three academic terms, 36 teaching weeks, and 138 structured lessons. The course is designed for Klassruum delivery with strong teacher modelling, guided practice, independent application, weekly review, and term-end mastery checks.",
    heroDescription:
        "Built to match Klassruum's goal of structured, accessible, high-quality teaching, this Grade 9 Mathematics course translates CBC-aligned yearly progression into lesson-by-lesson classroom delivery. It prioritises conceptual clarity, worked examples, learner confidence, error correction, and practical application rather than generic content dumping.",
    termIds: ["term1", "term2", "term3"],
});

export const KINGPIN_CBC_GRADE9_MATHEMATICS_TERM_1 = createGrade9MathematicsCourse({
    id: "kingpin-cbc-grade9-mathematics-term1-001",
    slug: "kenyan-cbc-grade-9-mathematics-term-1",
    title: "Kenyan CBC Grade 9 Mathematics - Term 1",
    subtitle: "Number, ratio, algebra foundations, and geometry basics for 12 teaching weeks",
    description:
        "The first term of Grade 9 Mathematics focuses on number fluency, proportional reasoning, early algebra, coordinates, and angle relationships. It is designed to stabilise learner confidence and prepare the class for the rest of the year.",
    heroDescription:
        "This term package is ideal for schools, departments, or pilots that want to begin Grade 9 Mathematics implementation with a tightly structured opening term. The lesson flow is deliberately scaffolded so teachers can build fluency, diagnose misconceptions early, and establish Klassruum delivery routines.",
    termIds: ["term1"],
});

export const KINGPIN_CBC_GRADE9_MATHEMATICS_TERM_2 = createGrade9MathematicsCourse({
    id: "kingpin-cbc-grade9-mathematics-term2-001",
    slug: "kenyan-cbc-grade-9-mathematics-term-2",
    title: "Kenyan CBC Grade 9 Mathematics - Term 2",
    subtitle: "Geometry, mensuration, transformations, statistics, and probability across 12 weeks",
    description:
        "The second term of Grade 9 Mathematics strengthens visual reasoning, measurement, transformations, and data literacy. Lessons combine diagram work, practical mensuration, and structured interpretation tasks so that learners can connect mathematics to visible real-world situations.",
    heroDescription:
        "This term package is designed for schools that want a clear, classroom-ready route through Grade 9 geometry and data themes. It emphasises modelling, accurate mathematical language, and repeated transition from teacher demonstration to learner practice.",
    termIds: ["term2"],
});

export const KINGPIN_CBC_GRADE9_MATHEMATICS_TERM_3 = createGrade9MathematicsCourse({
    id: "kingpin-cbc-grade9-mathematics-term3-001",
    slug: "kenyan-cbc-grade-9-mathematics-term-3",
    title: "Kenyan CBC Grade 9 Mathematics - Term 3",
    subtitle: "Advanced algebra, graphs, financial mathematics, and integrated problem solving",
    description:
        "The third term of Grade 9 Mathematics deepens algebraic reasoning, graph interpretation, financial numeracy, and integrated problem solving. It closes the year by pulling strands together into investigations, multi-step reasoning, and mastery-focused review.",
    heroDescription:
        "This term package helps teachers finish Grade 9 Mathematics with coherence and rigor. Lessons are written to support deeper reasoning, independent application, and thoughtful correction so learners do not simply complete the year but consolidate lasting mathematical habits.",
    termIds: ["term3"],
});

export const KINGPIN_GRADE9_MATHEMATICS_COURSES = [
    KINGPIN_CBC_GRADE9_MATHEMATICS_FULL_YEAR,
    KINGPIN_CBC_GRADE9_MATHEMATICS_TERM_1,
    KINGPIN_CBC_GRADE9_MATHEMATICS_TERM_2,
    KINGPIN_CBC_GRADE9_MATHEMATICS_TERM_3,
] as const;

export function getKingpinGrade9MathematicsCourses() {
    return [...KINGPIN_GRADE9_MATHEMATICS_COURSES];
}

export function getKingpinGrade9MathematicsCourseById(id: string) {
    return KINGPIN_GRADE9_MATHEMATICS_COURSES.find((course) => course.id === id) ?? null;
}

export function getKingpinGrade9MathematicsCourseBySlug(slug: string) {
    return KINGPIN_GRADE9_MATHEMATICS_COURSES.find((course) => course.slug === slug) ?? null;
}

export function findKingpinGrade9MathematicsLesson(lessonId: string) {
    for (const course of KINGPIN_GRADE9_MATHEMATICS_COURSES) {
        for (const module of course.modules) {
            for (const lesson of module.lessons) {
                if (lesson.id === lessonId) {
                    return {
                        course,
                        module,
                        lesson,
                    };
                }
            }
        }
    }

    return null;
}
