# Pocket Story · the same blank

**A fictional interactive story told through a simulated smartphone.**

*the same blank* is a fictional fan work featuring characters based on Kang Seulgi and Bae Joohyun. Through chats, work records, public posts, photographs, and forum discussions that appear gradually, the story explores how two people navigate intimacy, demanding schedules, and growing gaps in communication.

> **Current story baseline: V34 (2026-10-26)**
>
> This README describes the currently approved story outline. It does not mean that every outlined scene has already been implemented in the current web build. The story is being written, reviewed, and tested one self-contained node at a time. Earlier concepts built around opening with the Japan tour, player-selected forum interactions, or multiple player-determined endings are no longer the current direction.

## Story Outline

The story opens with a **KakaoTalk conversation after a rehearsal in August**—not with a forum investigation during the Japan tour or an obvious sign of relationship trouble.

### 1. August: Their Everyday Life

They live separately, but see each other almost every day through rehearsals and work. The opening first establishes the natural, intimate familiarity of a happy period in their relationship: how they chat, share small parts of their day, look after each other, and spend time together between work commitments.

The currently approved opening sequence is:

1. The first evening: a KKT conversation after rehearsal.
2. The following day: an ordinary rehearsal day.
3. Plans and conversations in the work group chat.
4. Casual conversations among the members after work.
5. **The fan meeting on August 2.**
6. Further moments from their close, everyday life throughout August.

### 2. Work Becomes More Demanding

As rehearsals, activities, and individual schedules become increasingly intense, they still care about each other. They continue to meet, work together, and show concern for one another. However, the exhaustion caused by their workload gradually affects how well they can express themselves and communicate.

Their relationship does not suddenly turn hostile, and the story does not frame one person as simply neglecting the other. Both are trying to manage their own circumstances, yet they gradually become less able to understand what the other is really trying to say.

### 3. The Japan Schedule: Gaps in Communication Emerge

During the Japan schedule, a specific gap in timing and communication becomes part of the story:

- Seulgi travels to Japan first without telling Joohyun in advance.
- Two days later, Joohyun also arrives in Japan but does not contact Seulgi directly.
- Seulgi only learns that Joohyun has arrived through a message relayed by their manager.

This is one part of how misunderstandings gradually become visible. It should not be exaggerated into a breakup, betrayal, or major confrontation. Their respective circumstances should continue to emerge through work arrangements, conversations, and actions.

### 4. Forum Discussions Appear Gradually

The forum is neither the opening scene nor a puzzle page filled with every clue from the start.

As conversations and events unfold, related posts, comments, and outside observations gradually become available to the player. People on the forum can only discuss what they have publicly seen. They may interpret things correctly or misunderstand them; the forum must never reveal private truths on behalf of the author.

Readers piece together fragments across different apps rather than receiving the full explanation from a single post or exposition dump.

## Relationship and Narrative Principles

- **Establish intimacy before showing change.** Do not begin with coldness, conflict, or one-sided pursuit.
- **The tension comes from communication gaps.** Heavy workloads, exhaustion, hesitation, and delayed expression affect the relationship. Neither person should be framed as the sole source of the problem.
- **Both characters must have agency.** Care and effort should not come from only one side. Even when distance emerges, preserve the genuine concern and actions of both people.
- **Do not explain everything for the characters.** Convey emotion through chats, timing, schedules, photographs, everyday details, and actions. Avoid having characters suddenly summarize the story's themes.
- **Public information is not private fact.** Stage interactions, airport appearances, social media posts, and fan discussions cannot independently prove the nature of a private relationship or a person's inner thoughts.

## Narrative Format and Apps

Pocket Story uses a simulated smartphone as its immersive narrative environment. The existing visual direction includes a dark, immersive phone experience, a native-style home screen and chat list, a Pann-inspired forum, YouTube pages, and LYSN-style subscription chat cards.

Each app has a distinct narrative role:

- **KakaoTalk (KKT):** Presents prewritten conversations and everyday interactions.
- **Forum (Pann-inspired):** Presents outside observations, discussions, misunderstandings, and differing opinions. Content appears gradually as the story progresses.
- **Instagram:** Provides a dated archive of sourced public posts.
- **Photos, Calendar, Maps, Notes, and other utilities:** Record images, time, places, work schedules, and traces of everyday life.
- **YouTube:** Supplements the story with public performances, channel pages, and videos.
- **LYSN:** Remains a separate space for customizable personas and free chat. It is kept apart from the main story, is not treated as evidence for the main plot, and does not change the characters' actions in the main narrative.

### How the Player Participates

The narrative is **written in advance by the author and discovered by the player through exploration of the phone**.

Players can explore the currently available chats, apps, and records in their own order. The order of discovery may vary, but free-text input or player replies do not make decisions on behalf of the characters and do not change the main events, relationships, or story outcomes.

The story is organized into independent narrative nodes. Each node is written in full and tested on its own before its continuity with neighboring nodes is reviewed. Story content is not tied to any particular version of the state machine or user interface.

## Fiction and Real-World Material

This project is a fictional fan work:

- Private conversations, inner thoughts, anonymous posts, private schedule details, and story events are fictional.
- Public photographs, public social media posts, and activity information are used only as sourced references for public timelines, locations, or visual context.
- Public footage, stage interactions, and fan speculation must not be presented as evidence of a real private relationship.
- The project does not connect to real accounts, real artist contacts, or real payment services.

## Local Development and Testing

The project is a static HTML / CSS / JavaScript site. It requires no build step or runtime server.

Start a local HTTP server from the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

Run the tests:

```bash
npm install
npm test
```

The root `index.html` is the GitHub Pages entry point and loads the application files from `dist/`. GitHub Pages is published through `.github/workflows/pages.yml`. The workflow runs when the `main` branch is updated and can also be triggered manually.

## Repository Assets and Sources

### Public Airport Photographs

The repository contains two public airport photographs dated **2026-09-28**, sourced from **Newsen / Ji Su-jin (지수진)**. The original images are preserved with their original watermarks. They are third-party editorial photographs, not assets created or generated by this project.

- `dist/assets/aseul-airport-20260928-irene.jpg` — https://www.newsen.com/news_view.php?code=100100&uid=202609281857343510
- `dist/assets/aseul-airport-20260928-seulgi.jpg` — https://www.newsen.com/news_view.php?code=100600&uid=202609281934203510

### Instagram Public-Content Archive

The Instagram material in this repository is a date-organized archive of public references, not a live feed or a complete mirror of either account. The current archive includes public-content records for `hi_sseulgi` and `renebaebae`. Images, dates, and source links are stored in the corresponding data files.

Collected sources include:

- 2026-09-16: Japan album updates and two food-related Stories. Source: https://theqoo.net/seulgi/4361583608?category=1827551682
- 2025-05-30: A Seulgi update containing an image of Irene. Source: https://theqoo.net/seulgi/4012428821
- 2025-06-12 and 2025-06-23: Styling / backstage updates and a BALANCE retrospective. Source: https://theqoo.net/seulgi/4018568127
- 2025-03-30: Film photographs of Irene posted by `by.sseulgi`; text and source index: https://www.fanforum.com/f509/baechu-%7Birene%7D-9-~-solo-irene-finally-coming-year-63278447/index10.html
- 2023-11-19: An Irene update and an index of Seulgi's public comment. Source: https://theqoo.net/seulgi/3022087917
- 2023-10-26: An index of Irene / Seulgi updates. Source: https://kpopping.com/kpics/231026-Red-Velvet-Irene-Instagram-Update-with-Seulgi

The two older entries above provide text indexes and source links only; no substitute images or fabricated original captions are used. Public material does not establish private relationship facts. All third-party material must retain its original source, attribution, and usage boundaries.
