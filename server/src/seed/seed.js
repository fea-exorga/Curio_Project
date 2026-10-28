/**
 * Curio – Seed Script
 * ────────────────────
 * Populates the database with realistic sample content for development.
 * Safe to re-run: skips records that already exist.
 * Development only. The script refuses to run when NODE_ENV=production.
 *
 * Usage:  npm run seed
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Like } from '../models/Like.js';

const SEED_POSTS = [
  // ── Computer Science ───────────────────────────────────────────
  {
    title: 'Why is Redis so fast?',
    caption:
      'Redis is often described as "blazing fast" – but what actually makes it faster than a traditional database like PostgreSQL or MySQL?\n\nThe primary reason is **memory-first storage**. While most databases write data to disk and read from disk, Redis keeps its entire dataset in RAM by default. RAM access latency is roughly 100–500 nanoseconds, compared to 100–300 microseconds for an SSD read – that\'s a 100× to 1000× difference.\n\nRedis also uses a single-threaded event loop (powered by I/O multiplexing via epoll/kqueue), meaning it handles thousands of concurrent connections without context-switching overhead. Its data structures – strings, hashes, sorted sets, lists – are implemented in highly optimized C, so operations like sorted set insertions are O(log N) and list pops are O(1).\n\nFinally, Redis speaks a simple protocol (RESP) and avoids JSON parsing overhead until you explicitly use JSON modules.',
    category: 'Computer Science',
    tags: ['redis', 'databases', 'backend', 'performance', 'cache'],
    contentType: 'image',
    mediaItems: [
      {
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        alt: 'Server room with blinking lights representing in-memory computing',
        order: 0,
      },
    ],
    takeaway:
      'Redis is fast primarily because it stores data in RAM (not disk), uses a single-threaded event loop, and implements common data structures in optimized C.',
    sourceUrl: 'https://redis.io/docs/get-started/faq/',
    sourceName: 'Redis Documentation',
    editorialPriority: 9,
    relatedTopics: ['How databases store data', 'Caching strategies', 'Event-driven I/O'],
  },
  {
    title: 'Processes vs. Threads: What\'s actually the difference?',
    caption:
      'If you\'ve used Node.js, Python, or Java, you\'ve probably encountered the words "process" and "thread" – often together, often confusingly.\n\nA **process** is an independent program in execution. It has its own memory space, its own file descriptors, and its own system resources. Processes are isolated from each other: one crashing process doesn\'t take down another.\n\nA **thread** is a unit of execution *within* a process. Multiple threads share the same memory space, which makes communication fast – but also introduces race conditions and requires careful synchronization.\n\nOn most operating systems, spawning a new process is more expensive than spawning a thread, but processes offer stronger isolation. This is why Chrome uses separate processes for each tab (crashing one tab doesn\'t bring down the browser), while Node.js uses threads via Worker Threads for CPU-intensive background work.\n\nThe trade-off: isolation vs. overhead vs. shared state.',
    category: 'Computer Science',
    tags: ['os', 'concurrency', 'threads', 'processes', 'systems'],
    contentType: 'carousel',
    mediaItems: [
      {
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        alt: 'Abstract digital network diagram',
        caption: 'Each process has its own isolated memory space.',
        order: 0,
      },
      {
        url: 'https://images.unsplash.com/photo-1537884944318-390069bb8665?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        alt: 'Threads sharing resources visualization',
        caption: 'Threads within a process share heap memory, enabling fast communication but requiring synchronization.',
        order: 1,
      },
    ],
    takeaway:
      'Processes are isolated programs with their own memory; threads are lightweight units within a process that share memory. Choose processes for isolation, threads for shared-state performance.',
    sourceUrl: 'https://www.kernel.org/doc/html/latest/scheduler/sched-design-CFS.html',
    sourceName: 'Linux Kernel Docs',
    editorialPriority: 8,
    relatedTopics: ['Concurrency vs. parallelism', 'The Global Interpreter Lock in Python'],
  },
  {
    title: 'How does DNS actually work?',
    caption:
      'Every time you type a URL into your browser, a surprisingly elegant distributed system called DNS (Domain Name System) translates it into an IP address in milliseconds.\n\nThe process:\n1. Your browser checks its **local cache**. Found? Done.\n2. If not, it asks your **operating system**, which checks its own cache and /etc/hosts.\n3. Next, it queries your **ISP\'s recursive resolver** – a server that does the heavy lifting.\n4. The resolver queries a **root nameserver** (there are 13 root server clusters globally), which says: "I don\'t know the IP, but for .com domains, ask Verisign\'s TLD nameserver."\n5. The TLD nameserver says: "Ask the **authoritative nameserver** for example.com."\n6. The authoritative nameserver finally returns the actual IP address.\n7. This result is **cached** at every layer to avoid repeating this journey.\n\nThe whole round trip often completes in under 50ms.',
    category: 'Computer Science',
    tags: ['networking', 'dns', 'internet', 'web', 'protocols'],
    contentType: 'text',
    mediaItems: [],
    takeaway:
      'DNS resolves domain names to IP addresses through a hierarchical chain: local cache → OS cache → recursive resolver → root → TLD → authoritative nameserver, with caching at every step.',
    sourceUrl: 'https://www.cloudflare.com/en-gb/learning/dns/what-is-dns/',
    sourceName: 'Cloudflare Learning',
    editorialPriority: 8,
    relatedTopics: ['HTTP vs HTTPS', 'How browsers render pages', 'CDNs and edge networks'],
  },

  // ── Technology and AI ──────────────────────────────────────────
  {
    title: 'Attention is all you need: What Transformers actually do',
    caption:
      'The 2017 paper "Attention Is All You Need" (Vaswani et al.) introduced the Transformer architecture that now powers GPT, BERT, Claude, Gemini, and virtually every modern large language model.\n\nBefore Transformers, sequence modeling relied on RNNs – which processed tokens sequentially, making it hard to capture long-range dependencies and difficult to parallelize.\n\nTransformers replaced this with **self-attention**: a mechanism that lets every token in a sequence look at every other token simultaneously, computing a weighted relevance score. The model learns *which* tokens to pay attention to for each prediction.\n\nThis had two revolutionary effects:\n• **Parallelism**: all tokens processed at once → dramatically faster training on GPUs.\n• **Long-range context**: a word at position 500 can directly attend to a word at position 1 with no information loss.\n\nThe "attention head" is the core building block. Large models like GPT-4 stack dozens of these in parallel and in sequence.',
    category: 'Technology and AI',
    tags: ['ai', 'ml', 'transformers', 'nlp', 'deep-learning'],
    contentType: 'image',
    mediaItems: [
      {
        url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        alt: 'Abstract neural network visualization',
        order: 0,
      },
    ],
    takeaway:
      'Transformers use self-attention to let every token relate to every other token simultaneously, enabling parallelism and long-range context that made modern LLMs possible.',
    sourceUrl: 'https://arxiv.org/abs/1706.03762',
    sourceName: 'arXiv: Attention Is All You Need',
    editorialPriority: 9,
    relatedTopics: ['What is fine-tuning?', 'How tokenization works', 'Vector embeddings explained'],
  },
  {
    title: 'What actually happens inside a GPU?',
    caption:
      'GPUs (Graphics Processing Units) were designed to render 3D graphics – pushing millions of pixels per frame by applying the same mathematical operation (shader) across thousands of pixels simultaneously. This is called **SIMD: Single Instruction, Multiple Data**.\n\nIt turns out neural network training is mathematically similar: applying matrix multiplications across millions of parameters in parallel. This is why Nvidia\'s CUDA-enabled GPUs became the dominant tool for AI training.\n\nA modern Nvidia H100 GPU has 16,896 CUDA cores running at ~1.83 GHz, 80GB of HBM3 memory with ~3.35 TB/s memory bandwidth, and delivers ~4 PetaFLOPS of FP8 training throughput.\n\nFor context: a high-end desktop CPU has 16–32 cores at ~5 GHz. It\'s not faster per core – GPUs are fast because they have *vastly* more parallelism, optimized for the specific math that both graphics and AI require.',
    category: 'Technology and AI',
    tags: ['gpu', 'hardware', 'ai', 'nvidia', 'computing'],
    contentType: 'image',
    mediaItems: [
      {
        url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        alt: 'Nvidia GPU circuit board with glowing components',
        order: 0,
      },
    ],
    takeaway:
      'GPUs are fast at AI training not because of clock speed, but because of massive parallelism (thousands of cores) optimized for the matrix math that both 3D rendering and neural networks require.',
    sourceUrl: 'https://www.nvidia.com/en-us/data-center/h100/',
    sourceName: 'Nvidia H100 Documentation',
    editorialPriority: 8,
  },

  // ── Hackathons and Opportunities (labeled as examples) ─────────
  {
    title: 'MLH Global Hackathon Season – [EXAMPLE POST]',
    caption:
      '⚠️ *This is a fictional example post demonstrating the format for Hackathon opportunities. Always verify real opportunities directly with the organizer.*\n\nMajor League Hacking runs hundreds of hackathons globally each year, from 24-hour local university events to multi-week online challenges.\n\n**Why hackathons matter:**\n- Build a real project in a time-constrained environment.\n- Collaborate with people you\'ve never met.\n- Explore APIs, cloud platforms, and hardware you wouldn\'t normally touch.\n- Win hardware, cloud credits, or cash prizes.\n- Meet recruiters from companies sponsoring the event.\n\nMLH also offers the **Local Hack Day** series, which runs community-driven mini-hackathons simultaneously worldwide, perfect for beginners.\n\n**How to prepare:** Pick a problem that interests your team. Focus on a working demo over a polished product. Presentation matters – you have 60–90 seconds to explain your idea.',
    category: 'Hackathons and Opportunities',
    tags: ['hackathon', 'mlh', 'programming', 'students', 'opportunities'],
    contentType: 'image',
    mediaItems: [
      {
        url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        alt: 'Group of students coding at laptops during a hackathon',
        order: 0,
      },
    ],
    takeaway:
      'Hackathons offer compressed, high-intensity practice on real problems with real constraints – among the best ways to accelerate practical engineering skills.',
    sourceUrl: 'https://mlh.io',
    sourceName: 'MLH (Major League Hacking)',
    editorialPriority: 7,
    relatedTopics: ['How to pitch at hackathons', 'Open source contribution', 'Building a developer portfolio'],
  },

  // ── Psychology and Human Behaviour ────────────────────────────
  {
    title: 'Why songs get stuck in our heads (earworms)',
    caption:
      'Nearly everyone has experienced an involuntary musical imagery – a catchy fragment of a song that loops endlessly in your mind. Psychologists call these **earworms** (from the German *Ohrwurm*).\n\nResearch from James Kellaris (University of Cincinnati) and later from the University of St Andrews found that earworms share common musical features: they\'re typically **simple**, **repetitive**, and contain an **unexpected interval or skip** that the brain\'s auditory cortex tries to "resolve."\n\nThe brain treats music like an incomplete loop. When it identifies a catchy melody, it activates the auditory cortex and motor cortex (even when music isn\'t playing), attempting to "finish" the pattern. Simple melodies with one surprising note are hardest to escape.\n\n**Cures that work (sometimes):** Finishing the full song, engaging in a cognitively demanding task, or chewing gum (which interrupts sub-vocal motor patterns associated with singing).',
    category: 'Psychology and Human Behaviour',
    tags: ['psychology', 'music', 'cognition', 'neuroscience', 'memory'],
    contentType: 'image',
    mediaItems: [
      {
        url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        alt: 'Person with headphones in a neon-lit environment',
        order: 0,
      },
    ],
    takeaway:
      'Earworms occur because simple, repetitive melodies with one unexpected interval activate auditory memory loops that the brain struggles to conclude.',
    sourceUrl: 'https://journals.sagepub.com/doi/10.1177/0305735606067155',
    sourceName: 'Psychology of Music Journal',
    editorialPriority: 8,
    relatedTopics: ['How memory consolidates during sleep', 'The cocktail party effect', 'Involuntary memories'],
  },
  {
    title: 'The Dunning-Kruger Effect: Why beginners feel like experts',
    caption:
      'In 1999, psychologists David Dunning and Justin Kruger published a landmark study that revealed a striking pattern: people with limited knowledge in a domain tend to overestimate their competence, while true experts often underestimate theirs.\n\nThe original study asked participants to rate their performance on logic, grammar, and humour tests. Those who scored in the bottom quartile estimated they were above average. Those who scored in the top quartile estimated they were average.\n\nThe mechanism: expertise requires the same metacognitive skills needed to recognize expertise. Without enough knowledge, you lack the tools to recognize what you don\'t know.\n\n**Why this matters:** It explains why online discourse is often dominated by confident newcomers. It also explains why genuine experts hedge their statements and feel uncertain – they can see the full landscape of what remains unknown.\n\nThe curve: beginners hit a "Peak of Mount Stupid," then descend into the "Valley of Despair" as complexity becomes apparent, then slowly climb the "Slope of Enlightenment."',
    category: 'Psychology and Human Behaviour',
    tags: ['psychology', 'cognitive-bias', 'dunning-kruger', 'learning', 'metacognition'],
    contentType: 'text',
    mediaItems: [],
    takeaway:
      'The Dunning-Kruger effect shows that limited knowledge prevents people from recognizing the limits of their own knowledge – a metacognitive blind spot that shrinks only as expertise deepens.',
    sourceUrl: 'https://doi.org/10.1037/0022-3514.77.6.1121',
    sourceName: 'Journal of Personality and Social Psychology',
    editorialPriority: 9,
    relatedTopics: ['Impostor syndrome', 'Confirmation bias', 'How experts think differently'],
  },

  // ── Science and Interesting Facts ─────────────────────────────
  {
    title: 'Light from the Sun takes 8 minutes to reach us – but 100,000 years to escape the Sun',
    caption:
      'The Sun is 150 million km away. Light travels at 299,792 km/s. So sunlight reaches Earth in roughly 8 minutes and 20 seconds – which you probably knew.\n\nWhat\'s stranger: that same photon of light, before it left the Sun\'s surface, was generated by nuclear fusion in the **solar core**. The core is so dense (150 g/cm³) and so packed with plasma that a photon can only travel a fraction of a millimeter before being absorbed and re-emitted in a random direction.\n\nThis random-walk process – absorption and re-emission millions of times – means that light produced in the core takes an estimated **100,000 to 170,000 years** to reach the surface (the photosphere), where it then travels to Earth in 8 minutes.\n\nThe light warming your face right now was generated during the Middle Palaeolithic period of human prehistory.',
    category: 'Science and Interesting Facts',
    tags: ['physics', 'space', 'sun', 'light', 'astronomy'],
    contentType: 'image',
    mediaItems: [
      {
        url: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        alt: 'Close-up photo of the Sun\'s surface showing solar flares',
        order: 0,
      },
    ],
    takeaway:
      'While sunlight takes 8 minutes to travel from the Sun to Earth, the same light spent up to 170,000 years escaping the Sun\'s dense interior via random-walk photon scattering.',
    sourceUrl: 'https://solar.nso.edu/public/education/sunlight.html',
    sourceName: 'National Solar Observatory',
    editorialPriority: 9,
    relatedTopics: ['Nuclear fusion explained', 'How we know the age of the universe', 'Cosmic time scales'],
  },

  // ── Current Affairs ────────────────────────────────────────────
  {
    title: 'What is a sovereign wealth fund? (and why they matter)',
    caption:
      'A sovereign wealth fund (SWF) is a state-owned investment fund that manages a country\'s surplus revenue – usually generated from natural resources (oil, gas, minerals) or trade surpluses.\n\nThe largest SWFs in 2025:\n1. **Norway Government Pension Fund Global** – ~$1.7 trillion (funded by North Sea oil revenues)\n2. **China Investment Corporation** – ~$1.35 trillion\n3. **Abu Dhabi Investment Authority** – ~$993 billion\n4. **Kuwait Investment Authority** – ~$900 billion\n5. **Saudi Arabia\'s Public Investment Fund** – ~$776 billion\n\nThese funds exist to:\n• Convert finite natural resources into long-term financial wealth.\n• Stabilize national budgets against commodity price swings.\n• Fund future generations when resource revenues decline.\n• Diversify national economies.\n\nNorway\'s fund, for example, owns roughly 1.4% of every listed company in the world and publishes its holdings with full transparency.',
    category: 'Current Affairs and World Events',
    tags: ['economics', 'finance', 'global', 'sovereign-wealth', 'norway'],
    contentType: 'text',
    mediaItems: [],
    takeaway:
      'Sovereign wealth funds are government-owned investment portfolios that convert national resource revenues into diversified long-term financial assets for future generations.',
    sourceUrl: 'https://www.swfinstitute.org/fund-rankings/',
    sourceName: 'Sovereign Wealth Fund Institute',
    editorialPriority: 7,
  },

  // ── Cinema and Filmography ─────────────────────────────────────
  {
    title: 'The Kubrick stare: how one shot conveys menace',
    caption:
      'Stanley Kubrick was obsessed with a specific framing technique: having his actors look slightly upward into the camera from a low angle, with their head tilted slightly forward. Film critics call it the **Kubrick stare**.\n\nYou\'ll see it in Alex in *A Clockwork Orange* (1971), Jack Torrance in *The Shining* (1980), Barry Lyndon\'s menacing duel opponents, and Full Metal Jacket\'s Private Pyle.\n\nThe psychological effect is powerful:\n• The subject looking *up* at the camera creates a slightly wider sclera (eye white visible above the iris), triggering an unconscious threat response in the viewer.\n• The low camera angle makes the subject appear dominant and looming.\n• The slight forward head tilt signals aggression and predatory focus.\n\nKubrick reportedly discovered this effect while directing Shelley Winters in *Lolita* and spent years refining it. It\'s now one of cinema\'s most recognized expressive tools.',
    category: 'Cinema and Filmography',
    tags: ['film', 'kubrick', 'cinematography', 'framing', 'visual-storytelling'],
    contentType: 'image',
    mediaItems: [
      {
        url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        alt: 'Dark dramatic cinema scene with intense framing',
        order: 0,
      },
    ],
    takeaway:
      'The Kubrick stare – low angle, head forward, eyes up – exploits unconscious threat-detection responses to signal menace and psychological instability without a single word of dialogue.',
    sourceUrl: 'https://www.criterion.com/current/posts/2977-the-shining-through-the-kubrick-stare',
    sourceName: 'The Criterion Collection',
    editorialPriority: 9,
    relatedTopics: ['Match cut technique', 'One-point perspective in film', 'Chiaroscuro lighting explained'],
  },
  {
    title: 'What is mise-en-scène? The invisible art of visual storytelling',
    caption:
      'Every frame of a film is a composition. Directors don\'t just point cameras at actors – they meticulously arrange everything visible within the frame to shape meaning. The French term for this total visual design is **mise-en-scène**: "placing on stage."\n\nMise-en-scène encompasses:\n• **Lighting** – low-key (noir shadows) vs. high-key (bright, even)\n• **Costume and makeup** – character coded through appearance\n• **Set design and props** – environment as psychological extension\n• **Actor positioning and movement** – proxemics and blocking\n• **Camera angle, distance, and lens** – how the viewer relates to the subject\n\nWes Anderson uses perfectly centered, symmetrical framing and vivid pastels to create a sense of controlled, melancholic artificiality. Christopher Nolan favors handheld wide-angle lenses to create intimate disorientation. David Fincher meticulously desaturates his palette to convey corporate dread.\n\nMise-en-scène is the director\'s visual language – you can often identify a director\'s film before anyone speaks.',
    category: 'Cinema and Filmography',
    tags: ['film', 'mise-en-scene', 'cinematography', 'directors', 'visual-language'],
    contentType: 'carousel',
    mediaItems: [
      {
        url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        alt: 'Film crew setting up a dramatic scene with specific lighting',
        caption: 'Lighting defines mood before a single line of dialogue.',
        order: 0,
      },
      {
        url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        alt: 'Empty cinema with golden light',
        caption: 'Every element in a frame is a deliberate directorial choice.',
        order: 1,
      },
    ],
    takeaway:
      'Mise-en-scène is the total visual design of a film frame – lighting, set, costume, positioning, and camera – through which directors communicate meaning without words.',
    editorialPriority: 8,
    relatedTopics: ['Rule of thirds in cinematography', 'Color theory in film', 'The 180-degree rule'],
  },

  // ── Anime and Entertainment ────────────────────────────────────
  {
    title: 'Sakuga: the art hidden inside anime animation',
    caption:
      'If you\'ve ever noticed a moment in an anime where the animation suddenly becomes *extraordinary* – fluid, expressive, lavishly detailed – you\'ve witnessed **sakuga** (作画).\n\nSakuga literally means "drawing pictures" in Japanese, but in animation fandom it refers specifically to *exceptional animation sequences* that stand out dramatically from a show\'s normal production level.\n\nThese moments happen because anime production is a complex, collaborative, often budget-constrained industry. A typical TV anime episode might be animated at 8–12 frames per second with simplified motion. But for a climactic fight scene or an emotional peak, a studio will bring in a star animator (*sakuga animator* or *animator genga artist*) who draws 24 frames per second with extraordinary expressiveness.\n\nFamous sakuga animators like Yutaka Nakamura (Bones), Norio Matsumoto, and Takeshi Honda are celebrated within the industry and by communities like sakugabooru.com, which catalogs exceptional sequences frame by frame.',
    category: 'Anime and Entertainment',
    tags: ['anime', 'animation', 'sakuga', 'studio', 'craft'],
    contentType: 'image',
    mediaItems: [
      {
        url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        alt: 'Illustrated anime character with dynamic motion blur',
        order: 0,
      },
    ],
    takeaway:
      'Sakuga refers to exceptional, hand-crafted animation sequences in anime where star animators elevate specific scenes to cinematic quality – often the most expressive frames in a series.',
    sourceUrl: 'https://sakugabooru.com',
    sourceName: 'Sakugabooru',
    editorialPriority: 8,
    relatedTopics: ['How anime is produced', 'Key animation vs in-between animation', 'Studio Trigger\'s production philosophy'],
  },

  // ── History and Culture ────────────────────────────────────────
  {
    title: 'How the Library of Alexandria actually fell',
    caption:
      'The Library of Alexandria is the most famous symbol of lost knowledge in history. But the popular image of a single catastrophic fire destroying the entire repository of ancient wisdom is largely a myth.\n\nThe reality is messier and more instructive:\n\nThe Library was founded around 300 BCE under Ptolemy I Soter and at its peak housed an estimated 400,000–700,000 scrolls – effectively the world\'s largest collection of texts in any domain.\n\nIt declined through *multiple* events over centuries:\n1. **48 BCE** – Julius Caesar\'s forces accidentally burned some ships in the harbor; fire spread to dockside warehouses containing scrolls. Not the Library itself.\n2. **270 CE** – Emperor Aurelian\'s attack on Alexandria destroyed the Brucheion district, where the Library was housed.\n3. **391 CE** – Theophilus, Christian Patriarch of Alexandria, destroyed the Serapeum temple (which housed a secondary library).\n4. **641 CE** – Arab conquest, though historical evidence for widespread book burning is thin.\n\nThe more honest answer: the Library faded as a living institution due to funding cuts, political instability, and the slow migration of scholarship to Byzantium and Baghdad.',
    category: 'History and Culture',
    tags: ['history', 'ancient', 'library', 'alexandria', 'knowledge'],
    contentType: 'image',
    mediaItems: [
      {
        url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        alt: 'Ancient architecture and columns representing classical library',
        order: 0,
      },
    ],
    takeaway:
      'The Library of Alexandria did not fall in a single dramatic fire but declined over centuries through multiple conflicts, funding failures, and political instability – a slower and more sobering lesson.',
    sourceUrl: 'https://www.britannica.com/topic/Library-of-Alexandria',
    sourceName: 'Encyclopaedia Britannica',
    editorialPriority: 9,
    relatedTopics: ['The Byzantine preservation of Greek texts', 'The House of Wisdom in Baghdad', 'How papyrus scrolls were stored'],
  },

  // ── Internet Culture and Digital Life ─────────────────────────
  {
    title: 'The origin of the internet meme: Richard Dawkins didn\'t expect this',
    caption:
      'The word **meme** was coined by evolutionary biologist Richard Dawkins in his 1976 book *The Selfish Gene*. He defined it as "an idea, behaviour, or style that spreads from person to person within a culture" – a cultural analog to the gene.\n\nDawkins combined the Greek *mimeme* (something imitated) with the English word "gene" to get *meme*. His examples were: melodies, catch-phrases, fashion trends, and architectural styles.\n\nForward to 1996: Mike Godwin coined Godwin\'s Law on Usenet ("As an online discussion grows longer, the probability of a comparison involving Nazis approaches 1"), and early internet communities began calling repeated image templates, phrases, and in-jokes "memes."\n\nThe image-macro meme – overlaying text on an image to express a relatable emotion or reaction – exploded in the late 2000s with sites like 4chan, Reddit, and eventually Instagram and TikTok.\n\nDawkins has said he is amused and somewhat puzzled by what his academic concept became. The internet version retains his core idea: a unit of cultural information that replicates, mutates, and survives based on how resonant it is.',
    category: 'Internet Culture and Digital Life',
    tags: ['memes', 'internet-culture', 'dawkins', 'history', 'digital'],
    contentType: 'text',
    mediaItems: [],
    takeaway:
      'Richard Dawkins invented the word "meme" in 1976 to describe units of cultural replication – decades before the internet adapted it to mean shareable image-based jokes and reaction formats.',
    sourceUrl: 'https://www.richarddawkins.net/the-selfish-gene/',
    sourceName: 'Richard Dawkins Foundation',
    editorialPriority: 7,
    relatedTopics: ['How viral content spreads', 'Digital folklore and copypasta', 'The evolution of internet language'],
  },
  {
    title: 'Why your brain struggles to end Netflix sessions',
    caption:
      'Netflix, YouTube, and most streaming platforms are optimized around a phenomenon psychologists call the **end-of-episode void** – the uncomfortable gap between finishing content and deciding what to do next.\n\nAutoplay was designed to eliminate that void entirely. Netflix\'s research showed that a significant portion of watch session drop-offs occurred *between* episodes, not during them. Autoplay reduced drop-offs by filling the decision space with momentum.\n\nBut there\'s a deeper cognitive mechanism at work: **Zeigarnik effect**. Our brains preferentially remember and fixate on *incomplete* tasks. A cliffhanger creates an open loop – an unresolved cognitive tension – that your working memory holds onto, creating a mild compulsion to resolve it by watching the next episode.\n\nStreaming companies compound this with **variable reward schedules** (borrowed from slot machine design): not every episode is equally good, which creates a pattern of intermittent reinforcement that is more compulsive than consistent rewards.\n\nRecognizing these mechanisms doesn\'t remove their power, but it creates the cognitive space to make a deliberate choice.',
    category: 'Internet Culture and Digital Life',
    tags: ['psychology', 'streaming', 'netflix', 'addiction', 'ux-design'],
    contentType: 'image',
    mediaItems: [
      {
        url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        alt: 'Person watching TV in a dark room with glowing screen',
        order: 0,
      },
    ],
    takeaway:
      'Autoplay exploits the Zeigarnik effect (open cognitive loops demand closure) and variable reward schedules to make "one more episode" a neurological pull, not just a preference.',
    editorialPriority: 8,
    relatedTopics: ['Variable reward schedules in app design', 'The attention economy', 'How to reclaim deliberate media consumption'],
  },
];

const seedDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Seeding is disabled in production. Seed a development database instead.');
    }
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/curio';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    const adminUser = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
    if (!adminUser) throw new Error('Create an account, promote it with `npm run make-admin -- <username>`, then run the seed script.');

    // Create seed posts
    let createdCount = 0;
    let skippedCount = 0;

    for (const postData of SEED_POSTS) {
      const existing = await Post.findOne({ title: postData.title });
      if (existing) {
        skippedCount++;
        continue;
      }

      await Post.create({
        ...postData,
        author: adminUser._id,
        status: 'published',
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // random date in last 30 days
      });
      createdCount++;
    }

    console.log(`\n[Seed] ✅ Seeding complete!`);
    console.log(`   Posts created : ${createdCount}`);
    console.log(`   Posts skipped : ${skippedCount} (already exist)`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
