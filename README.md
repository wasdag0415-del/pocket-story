# Pann · 日本巡演第二夜

A fictional fan-work exploration game about Kang Seulgi and Bae Juhyun, inside the existing simulated phone. All dialogue, tour incidents, anonymous posts and media reconstructions are invented. Nothing connects to real accounts or celebrity contacts.

## Run and publish

Buildless static HTML/CSS/JS with no build step or runtime dependencies. The current ChatGPT Site is public and deploys `dist/` using `.openai/hosting.json`.

The repository-root `index.html` is the GitHub Pages entry file. It loads the complete application from `dist/`, so the repository has the familiar `index.html` structure without duplicating the 36 MB image collection. GitHub Pages publication is defined in `.github/workflows/pages.yml`. Push the repository to GitHub with `main` as its default branch, then select **GitHub Actions** as the Pages source in the repository settings. Every push to `main` publishes the site; the workflow can also be run manually.

The source code may be opened under the repository owner's chosen license. Photographs in `dist/assets/` are third-party editorial or archived public images and are not covered by a source-code license; preserve their credits and source links.

## Episode 1

Start in the fictional Pann-style forum as an ordinary reader on their own phone. The only two forum categories are fandom discussion and relationship advice. Read a full curtain-call sequence and the anonymous older-partner advice post before comparing their details. The conflict is intentionally small: one person avoids the conversation because she fears becoming a burden, while the other is too exhausted to keep talking or guess what the silence means. A first forum decision unlocks a third-night eyewitness thread and new messages from fellow reader 小满. KakaoTalk then unlocks an explicitly fictional chapter replay of the protagonists' conversation, separate from the player's own phone and real accounts. LYSN is the customizable character-chat area and retains the existing local personas, group chats, voice messages and simulated transfers. Instagram remains public-source material; anonymous forum accounts remain unconfirmed. Stable evidence IDs and saved chat data are retained for compatibility.

Narrative evidence uses labeled HTML/CSS diagrams and text records. The main thread additionally contains credited real airport photographs as atmosphere references, separate from the fictional storyline. LYSN and Weverse are coherent additional story surfaces. The phone's original configurable contacts, local simulated chat, voice messages, simulated transfers, group chats, photos and notes remain available.

## Persistence and updates

- Existing phone data stays under `pocket-star-v1`; recorded audio remains in the existing `pocket-star-audio` IndexedDB.
- New narrative state uses `pocket-story-same-blank-ch1-v2` with a versioned schema. It never writes the phone's chat or audio stores.
- Story records live in `dist/story-data.js`. Keep the episode ID and existing post/comment/evidence IDs stable; append content rather than recreating IDs.
- `dist/story.js` handles forum browsing, search, clues, branching and independent save export/import. `dist/story.css` styles these views; `dist/pann.css` scopes a Pann-inspired white/red ranked forum and BEST replies to forum views. Forum post recommendations are additive save fields and preserve existing progress.
- Exploration notes export/import story JSON. Import requires an explicit in-game confirmation before replacement. Settings retain the existing phone export; recorded audio blobs are not included in that text export.
- Progress stays in this browser; exports support manual backup and transfer. No cloud sync or real AI replies.

## Validation

`npm install` then `npm test` runs DOM-based integration tests using LinkeDOM (`tests/story-flow.cjs`). They cover boot, swipe-to-unlock and passcode, forum reading and bookmarks, the three forum replies, the outsider advice panel, the progress card, the official post, the final judgment and chapter completion, rumor fragments, category search, the free-text KakaoTalk chapter, save/reload persistence, legacy phone-data isolation, HTML escaping and save export. Run `node --check` on shipped JavaScript for syntax.

Chapter 01 closes through the official post: once the conversation reaches its last step, the feed's progress card offers `刷新热帖，查看官方更新`, which unlocks the RV JP photos and the `保存这条记录，结束第一章` button.

Managed preview/browser QA was unavailable in this environment; no preview server was started. Visual layout, microphone permissions, audible playback and real phone keyboard behavior still need actual browser/device QA.


## Airport photograph credits

The main forum thread includes two real public airport photographs from **2026-09-28**, credited to **Newsen / 지수진**. Files retain the full frame and the original watermark. The forum caption explicitly separates real photographs from fictional posts and relationship storylines.

- `dist/assets/aseul-airport-20260928-irene.jpg`: https://www.newsen.com/news_view.php?code=100100&uid=202609281857343510
- `dist/assets/aseul-airport-20260928-seulgi.jpg`: https://www.newsen.com/news_view.php?code=100600&uid=202609281934203510

These are third-party editorial photographs, not project-owned or generated assets. Source links and credits are also available in the in-app image viewer.


## Public Instagram archive

Instagram now has two selectable public-content profiles: `hi_sseulgi` and `renebaebae`. The curated first batch contains **8 records and 71 locally packaged photographs**. The page explicitly states that it is a dated archive rather than a live or complete copy of either account. Account ownership, dates, source URLs and every image's archived URL are in `dist/instagram-data.js`.

- 2026-09-16: Japanese album update (13 photos) and two dining Stories, from https://theqoo.net/seulgi/4361583608?category=1827551682
- 2025-05-30: Seulgi update with an Irene image among the carousel, from https://theqoo.net/seulgi/4012428821
- 2025-06-12 and 2025-06-23: styling/backstage update and BALANCE recap, from https://theqoo.net/seulgi/4018568127
- 2025-03-30: `by.sseulgi` film photograph of Irene; caption and original-post link are documented at https://www.fanforum.com/f509/baechu-%7Birene%7D-9-~-solo-irene-finally-coming-year-63278447/index10.html
- 2023-11-19: Irene update and Seulgi's documented public comment, indexed at https://theqoo.net/seulgi/3022087917
- 2023-10-26: Irene/Seulgi update indexed at https://kpopping.com/kpics/231026-Red-Velvet-Irene-Instagram-Update-with-Seulgi

The last two entries are **text indexes and source links only**: no substitute photographs or invented original captions. The Korean captions for image posts are short archived excerpts, with Chinese reading translations. Real material does not establish a private relationship. The earlier invented drinks/night-road material remains in a separate explicitly fictional view. Images retain their original files; profile thumbnails crop only in CSS, while the post viewer shows the full image. Likes/follower counts are not fabricated. Saved archive records use the additive `igSaved` field in the existing story save; free chat/voice storage is unchanged.
