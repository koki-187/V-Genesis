# V-Genesis: Universal Video Production Pipeline - Complete Design Document

**Plan Name:** v-genesis-universal-pipeline
**Date:** 2026-04-08
**Scope:** YouTube解説動画 / ショート動画 / プロモーション動画 - 全ジャンル対応
**Estimated Complexity:** HIGH

---

## 1. Directory Structure

```
V-Genesis/
├── CLAUDE.md                          # Project-level AI instructions
├── AGENTS.md                          # Agent role assignments (optional reference)
├── .claude/
│   └── settings.json                  # Hooks, permissions, MCP config
│
├── .omc/
│   ├── plans/                         # Work plans
│   ├── state/                         # Session state
│   ├── logs/                          # Execution logs
│   ├── research/                      # Research outputs
│   ├── notepad.md                     # Scratch notes
│   └── project-memory.json            # Persistent memory
│
├── config/
│   ├── pipeline.yaml                  # Master pipeline definition
│   ├── video-types.yaml               # Video type templates (解説/ショート/プロモ)
│   ├── platforms.yaml                 # Platform specs (YouTube/TikTok/Instagram)
│   ├── quality-gates.yaml             # Quality checkpoints per phase
│   └── brand/
│       ├── brand-guide.yaml           # Brand voice, tone, visual identity
│       ├── color-palette.yaml         # Color definitions
│       └── typography.yaml            # Font specifications
│
├── templates/
│   ├── scripts/
│   │   ├── explainer-long.md          # 解説動画 (10-30min) script template
│   │   ├── explainer-short.md         # ショート解説 (1-3min) script template
│   │   ├── shorts.md                  # Shorts/Reels (15-60sec) script template
│   │   └── promo.md                   # プロモーション動画 script template
│   ├── storyboards/
│   │   ├── explainer.yaml             # Storyboard structure for 解説
│   │   ├── shorts.yaml                # Storyboard structure for ショート
│   │   └── promo.yaml                 # Storyboard structure for プロモ
│   ├── thumbnails/
│   │   ├── styles.yaml                # Thumbnail design patterns
│   │   └── canva-specs.yaml           # Canva template references
│   └── descriptions/
│       ├── youtube-desc.md            # YouTube description template
│       ├── shorts-desc.md             # Shorts description template
│       └── tags-template.yaml         # Tag/keyword template
│
├── projects/
│   └── {project-id}/                  # Per-project workspace
│       ├── brief.yaml                 # Project brief / input
│       ├── research/
│       │   ├── topic-research.md      # Topic deep-dive
│       │   ├── competitor-analysis.md # Competitor video analysis
│       │   ├── keyword-research.md    # SEO/keyword data
│       │   └── audience-insights.md   # Target audience analysis
│       ├── script/
│       │   ├── outline.md             # Structure outline
│       │   ├── draft-v1.md            # First draft
│       │   ├── draft-final.md         # Approved script
│       │   └── narration-notes.md     # Delivery/tone notes
│       ├── visual/
│       │   ├── storyboard.md          # Scene-by-scene visual plan
│       │   ├── shot-list.yaml         # Shot specifications
│       │   ├── asset-list.yaml        # Required assets (images, footage, etc.)
│       │   ├── motion-specs.yaml      # Animation/motion graphics specs
│       │   └── thumbnail/
│       │       ├── concepts.md        # Thumbnail concepts
│       │       └── final/             # Exported thumbnails
│       ├── audio/
│       │   ├── music-selection.yaml   # BGM choices
│       │   ├── sfx-list.yaml          # Sound effects
│       │   └── voiceover-specs.yaml   # VO specifications
│       ├── edit/
│       │   ├── edit-decision-list.yaml # EDL
│       │   ├── color-grade.yaml       # Color grading notes
│       │   └── captions/
│       │       ├── ja.srt             # Japanese subtitles
│       │       └── en.srt             # English subtitles
│       ├── publish/
│       │   ├── metadata.yaml          # Title, description, tags, etc.
│       │   ├── schedule.yaml          # Publish schedule
│       │   ├── distribution.yaml      # Cross-platform distribution plan
│       │   └── community-posts.md     # Community tab / social posts
│       ├── review/
│       │   ├── quality-report.md      # Quality gate results
│       │   ├── accessibility-check.md # Accessibility review
│       │   └── feedback-log.md        # Revision feedback
│       └── analytics/
│           ├── predictions.md         # Performance predictions
│           └── post-publish.md        # Post-publish analytics
│
├── assets/
│   ├── fonts/                         # Project fonts
│   ├── logos/                         # Brand logos
│   ├── music/                         # Licensed music
│   ├── sfx/                           # Sound effects
│   ├── stock/                         # Stock footage/images
│   └── overlays/                      # Overlays, lower-thirds, etc.
│
├── tools/
│   ├── scripts/
│   │   ├── new-project.sh             # Create new project from template
│   │   ├── export-metadata.sh         # Export metadata for upload
│   │   └── archive-project.sh         # Archive completed project
│   └── prompts/
│       ├── research-prompt.md         # Reusable research prompt
│       ├── script-prompt.md           # Reusable script writing prompt
│       ├── review-prompt.md           # Reusable review prompt
│       └── seo-prompt.md              # Reusable SEO optimization prompt
│
└── knowledge-base/
    ├── best-practices.md              # Video production best practices
    ├── youtube-algorithm.md           # Platform algorithm notes
    ├── audience-personas.yaml         # Audience persona definitions
    └── style-guides/
        ├── narration-style.md         # Narration style guide
        ├── visual-style.md            # Visual style guide
        └── editing-style.md           # Editing style guide
```

---

## 2. Agent Role Assignments (34 Agents)

### Phase 1: Research & Planning (Pre-Production)

| Agent | Model | Role in V-Genesis |
|-------|-------|-------------------|
| **explore** | haiku | Codebase navigation. Locate templates, configs, past projects for reuse. Quick file/structure lookups. |
| **planner** | opus | Master pipeline orchestrator. Creates project plans, sequences phases, assigns agent work, manages dependencies. |
| **analyst** | opus | Deep topic research. Analyzes competitor videos, audience data, trend signals. Gap analysis on scripts/briefs. |
| **architect** | opus | Pipeline architecture decisions. Designs project structure, template schemas, workflow patterns. ADR creation. |
| **scientist** | sonnet | A/B test design for thumbnails, titles, hooks. Hypothesis-driven optimization of video performance. |
| **ux-researcher** | sonnet | Audience persona development. Viewer journey mapping. Comment sentiment analysis. Engagement pattern research. |
| **document-specialist** | sonnet | External API/SDK documentation lookup. Platform spec research (YouTube API, Canva API). Tool integration docs. |

### Phase 2: Script & Content Creation (Production - Writing)

| Agent | Model | Role in V-Genesis |
|-------|-------|-------------------|
| **writer** | haiku | First-draft script generation. Description writing. Community post drafting. Fast iterative text output. |
| **prompter** | sonnet | Craft optimized prompts for AI image/video generation tools (Midjourney, Runway, Sora). Prompt engineering for asset creation. |
| **localization** | haiku | Japanese/English subtitle generation. Multilingual metadata. Translation and cultural adaptation. |
| **critic** | opus | Script quality review. Narrative structure analysis. Hook effectiveness evaluation. Pacing critique. |
| **code-simplifier** | opus | Script simplification. Remove jargon, tighten language, improve clarity without losing substance. |

### Phase 3: Visual & Design (Production - Visual)

| Agent | Model | Role in V-Genesis |
|-------|-------|-------------------|
| **designer** | sonnet | Thumbnail design direction. Visual style definition. Storyboard creation. Color palette / typography selection. |
| **accessibility** | sonnet | WCAG compliance for thumbnails. Caption quality. Color contrast checks. Screen reader compatibility for descriptions. |

### Phase 4: Technical Production (Post-Production)

| Agent | Model | Role in V-Genesis |
|-------|-------|-------------------|
| **executor** | sonnet/opus | Primary task executor. Runs pipeline steps, generates files, applies templates, executes multi-file changes. |
| **debugger** | sonnet | Pipeline error diagnosis. Fix broken templates, malformed YAML, missing assets. Troubleshoot tool integrations. |
| **tracer** | sonnet | Trace pipeline execution flow. Identify bottlenecks. Log phase transitions and timing. |
| **optimizer** | sonnet | Pipeline performance optimization. Reduce redundant steps. Parallelize independent phases. Metadata optimization for SEO. |
| **data-pipeline** | sonnet | Manage data flow between phases. ETL for analytics data. Transform research data into structured briefs. |

### Phase 5: Quality Assurance & Review

| Agent | Model | Role in V-Genesis |
|-------|-------|-------------------|
| **qa-tester** | sonnet | Quality gate enforcement. Verify each deliverable meets acceptance criteria. Checklist validation. |
| **code-reviewer** | opus | Deep review of scripts, metadata, and pipeline configs. Structural integrity checks. |
| **verifier** | sonnet | Final verification before publish. Cross-check metadata, assets, descriptions, links, schedule. |
| **security-reviewer** | sonnet | Content safety review. Copyright/licensing compliance. Brand safety. Sensitive content flagging. |
| **compliance** | opus | COPPA/FTC compliance for sponsored content. Music licensing verification. Platform TOS adherence. |
| **risk-assessor** | opus | Evaluate publication risk. Controversy potential. Demonetization risk. Brand reputation impact. |

### Phase 6: Publishing & Distribution

| Agent | Model | Role in V-Genesis |
|-------|-------|-------------------|
| **api-designer** | sonnet | YouTube Data API integration design. Upload workflow API contracts. Webhook definitions. |
| **devops** | sonnet | CI/CD for publishing pipeline. Automated upload scripts. Schedule management. Deployment of pipeline updates. |
| **git-master** | sonnet | Version control for all project assets. Branch strategy per project. Release tagging for published videos. |
| **database** | sonnet | Project metadata storage. Analytics data schema. Query optimization for performance tracking. |

### Phase 7: Post-Publish & Optimization

| Agent | Model | Role in V-Genesis |
|-------|-------|-------------------|
| **monitor** | sonnet | Post-publish performance monitoring. Alert on abnormal metrics (CTR drop, engagement anomaly). Dashboard maintenance. |
| **mobile** | sonnet | Mobile viewing optimization. Verify thumbnail legibility on small screens. Mobile-first preview checks. |
| **migrator** | sonnet | Template migration when formats change. Platform spec updates. Archive migration for old projects. |
| **refactorer** | opus | Pipeline refactoring. Template improvement based on lessons learned. Process optimization. |

---

## 3. CLAUDE.md Content

```markdown
# V-Genesis - Universal Video Production Pipeline

## Project Overview
V-Genesis is an AI-orchestrated video production pipeline that handles all phases
from research to publication for YouTube explainer videos, Shorts, and promotional
content across any genre or topic.

## Core Principles
- Every video project follows the same 7-phase pipeline regardless of type
- Quality gates between phases prevent defects from propagating forward
- Templates provide structure; AI agents provide speed and intelligence
- All decisions are traceable through project artifacts

## Pipeline Phases
1. **Research & Planning** - Topic research, competitor analysis, brief creation
2. **Script & Content** - Outline, draft, review, finalize script
3. **Visual & Design** - Storyboard, thumbnail, asset specification
4. **Technical Production** - Assembly, editing specs, caption generation
5. **Quality Assurance** - Quality gates, compliance, accessibility
6. **Publishing** - Metadata, schedule, upload, distribution
7. **Post-Publish** - Monitor, analyze, optimize, archive

## Video Types
- `explainer-long`: YouTube 解説動画 (10-30min). Deep-dive educational content.
- `explainer-short`: Short 解説 (1-3min). Concise educational content.
- `shorts`: YouTube Shorts / Reels (15-60sec). Hook-first, vertical, high-energy.
- `promo`: Promotional video (30sec-5min). Product/service/event focused.

## File Conventions
- Project workspace: `projects/{YYYY-MM-DD}-{slug}/`
- Scripts in Markdown. Metadata in YAML. Structured data in YAML.
- Japanese is the primary language. English subtitles are secondary.
- All timestamps in JST (Asia/Tokyo).

## Agent Routing
- Research tasks -> analyst (opus), ux-researcher (sonnet)
- Writing tasks -> writer (haiku) for drafts, critic (opus) for review
- Visual tasks -> designer (sonnet)
- Quality tasks -> qa-tester (sonnet), verifier (sonnet)
- Publishing tasks -> devops (sonnet), executor (sonnet)
- Risk evaluation -> risk-assessor (opus), compliance (opus), security-reviewer (sonnet)

## Quality Gates
Each phase transition requires passing its quality gate:
- **Research -> Script**: Brief completeness check (all required fields populated)
- **Script -> Visual**: Script review score >= 8/10, hook effectiveness validated
- **Visual -> Production**: Storyboard completeness, asset list verified
- **Production -> QA**: All deliverables present, format validation passed
- **QA -> Publish**: All quality checks passed, risk assessment GREEN/YELLOW
- **Publish -> Live**: Metadata complete, schedule confirmed, final verification

## Content Guidelines
- Hook within first 3 seconds (Shorts) or first 15 seconds (Long-form)
- Clear value proposition in title and first line of description
- Call-to-action placement: mid-video + end (long-form), end only (shorts)
- Thumbnail must be legible at 168x94px (mobile size)

## Prohibited Actions
- Never publish without passing all quality gates
- Never use unlicensed music or copyrighted footage
- Never include personal/private information in public metadata
- Never bypass compliance review for sponsored content
- Never delete project archives within 90 days of publication

## Tools & Integrations
- **Canva**: Thumbnail design (via MCP)
- **YouTube Data API**: Upload, metadata, analytics
- **Notion**: Project tracking database (via MCP)
- **Google Calendar**: Publication scheduling (via MCP)
- **Gmail**: Collaboration notifications (via MCP)

## Template Variables
When creating projects from templates, these variables are replaced:
- `{{PROJECT_ID}}`: Auto-generated project identifier
- `{{VIDEO_TYPE}}`: One of explainer-long, explainer-short, shorts, promo
- `{{TOPIC}}`: Main topic/subject
- `{{TARGET_AUDIENCE}}`: Primary audience persona
- `{{PUBLISH_DATE}}`: Scheduled publication date
- `{{LANGUAGE}}`: Primary language (default: ja)
```

---

## 4. Key Configuration Files

### 4.1 config/pipeline.yaml

```yaml
# V-Genesis Master Pipeline Definition
version: "1.0"
name: "V-Genesis Universal Video Pipeline"

defaults:
  language: "ja"
  timezone: "Asia/Tokyo"
  quality_threshold: 8  # out of 10

phases:
  1_research:
    name: "Research & Planning"
    agents:
      primary: analyst
      support: [explore, ux-researcher, document-specialist, scientist]
    inputs:
      - brief.yaml
    outputs:
      - research/topic-research.md
      - research/competitor-analysis.md
      - research/keyword-research.md
      - research/audience-insights.md
    quality_gate:
      name: "research-completeness"
      criteria:
        - "Topic research covers >= 5 sources"
        - "Competitor analysis includes >= 3 comparable videos"
        - "Keyword research has primary + secondary keywords"
        - "Audience persona is defined"
      reviewer: qa-tester

  2_script:
    name: "Script & Content Creation"
    depends_on: [1_research]
    agents:
      primary: writer
      support: [critic, code-simplifier, prompter, localization]
    inputs:
      - research/*
      - templates/scripts/{video_type}.md
    outputs:
      - script/outline.md
      - script/draft-v1.md
      - script/draft-final.md
      - script/narration-notes.md
    quality_gate:
      name: "script-review"
      criteria:
        - "Hook effectiveness score >= 8/10"
        - "Script length within target range for video type"
        - "Key messages from brief are all addressed"
        - "CTA placement follows guidelines"
        - "Critic review completed with score >= 8/10"
      reviewer: critic

  3_visual:
    name: "Visual & Design"
    depends_on: [2_script]
    agents:
      primary: designer
      support: [prompter, accessibility, mobile]
    inputs:
      - script/draft-final.md
      - config/brand/*
      - templates/storyboards/{video_type}.yaml
    outputs:
      - visual/storyboard.md
      - visual/shot-list.yaml
      - visual/asset-list.yaml
      - visual/motion-specs.yaml
      - visual/thumbnail/concepts.md
    quality_gate:
      name: "visual-completeness"
      criteria:
        - "Every script section has corresponding storyboard entry"
        - "All required assets are listed with source/license"
        - "Thumbnail concepts >= 3 variations"
        - "Thumbnail legible at 168x94px (mobile check)"
        - "Accessibility review passed (contrast, readability)"
      reviewer: qa-tester

  4_production:
    name: "Technical Production"
    depends_on: [3_visual]
    agents:
      primary: executor
      support: [debugger, tracer, optimizer, data-pipeline, localization]
    inputs:
      - script/draft-final.md
      - visual/*
      - audio/*
    outputs:
      - audio/music-selection.yaml
      - audio/sfx-list.yaml
      - audio/voiceover-specs.yaml
      - edit/edit-decision-list.yaml
      - edit/color-grade.yaml
      - edit/captions/ja.srt
      - edit/captions/en.srt
    quality_gate:
      name: "production-check"
      criteria:
        - "EDL covers all scenes from storyboard"
        - "Caption timing synced with script"
        - "Music/SFX selections have valid licenses"
        - "All asset references resolve to existing files"
      reviewer: verifier

  5_qa:
    name: "Quality Assurance & Review"
    depends_on: [4_production]
    agents:
      primary: qa-tester
      support: [code-reviewer, verifier, security-reviewer, compliance, risk-assessor]
    inputs:
      - "*"  # All project artifacts
    outputs:
      - review/quality-report.md
      - review/accessibility-check.md
    quality_gate:
      name: "publish-readiness"
      criteria:
        - "All previous quality gates passed"
        - "Security review: no copyright issues"
        - "Compliance review: FTC/COPPA adherence (if sponsored)"
        - "Risk assessment: GREEN or YELLOW (RED blocks publish)"
        - "Accessibility: captions present, thumbnail contrast OK"
      reviewer: code-reviewer

  6_publish:
    name: "Publishing & Distribution"
    depends_on: [5_qa]
    agents:
      primary: devops
      support: [api-designer, git-master, database, executor]
    inputs:
      - publish/*
      - review/quality-report.md
    outputs:
      - publish/metadata.yaml
      - publish/schedule.yaml
      - publish/distribution.yaml
      - publish/community-posts.md
    quality_gate:
      name: "publish-final"
      criteria:
        - "Metadata complete (title, description, tags, category)"
        - "Thumbnail uploaded"
        - "Schedule confirmed"
        - "Distribution plan for cross-platform"
      reviewer: verifier

  7_post_publish:
    name: "Post-Publish & Optimization"
    depends_on: [6_publish]
    agents:
      primary: monitor
      support: [scientist, optimizer, refactorer, migrator, database]
    inputs:
      - publish/*
      - analytics/*
    outputs:
      - analytics/post-publish.md
    quality_gate:
      name: "archive-ready"
      criteria:
        - "72-hour performance snapshot captured"
        - "Lessons learned documented"
        - "Template improvements filed (if any)"
      reviewer: qa-tester
```

### 4.2 config/video-types.yaml

```yaml
# Video Type Definitions
video_types:

  explainer-long:
    display_name: "解説動画 (ロング)"
    description: "Deep-dive educational content on a specific topic"
    duration:
      min: 600    # 10 minutes
      max: 1800   # 30 minutes
      target: 900 # 15 minutes
    aspect_ratio: "16:9"
    orientation: "landscape"
    platform: "youtube"
    script:
      template: "templates/scripts/explainer-long.md"
      sections:
        - hook          # 0-15sec: Attention grab
        - intro         # 15-45sec: Topic introduction + value prop
        - context       # Background/why this matters
        - main_points   # 3-5 key sections with examples
        - practical     # Actionable takeaways
        - summary       # Recap key points
        - cta           # Subscribe, comment, next video
      word_count:
        min: 1500
        max: 4500
    thumbnail:
      size: "1280x720"
      text_limit: 5  # words max
      face_required: false
    seo:
      title_max_length: 70
      description_min_length: 200
      tags_min: 10
      tags_max: 30
      hashtags: 3

  explainer-short:
    display_name: "解説動画 (ショート)"
    description: "Concise educational content, quick explanation"
    duration:
      min: 60     # 1 minute
      max: 180    # 3 minutes
      target: 120 # 2 minutes
    aspect_ratio: "16:9"
    orientation: "landscape"
    platform: "youtube"
    script:
      template: "templates/scripts/explainer-short.md"
      sections:
        - hook          # 0-5sec: Immediate hook
        - single_point  # One key concept explained clearly
        - example       # Quick example or demonstration
        - cta           # Brief call to action
      word_count:
        min: 150
        max: 450
    thumbnail:
      size: "1280x720"
      text_limit: 4
      face_required: false
    seo:
      title_max_length: 70
      description_min_length: 100
      tags_min: 8
      tags_max: 20
      hashtags: 3

  shorts:
    display_name: "ショート動画"
    description: "YouTube Shorts / Instagram Reels / TikTok format"
    duration:
      min: 15     # 15 seconds
      max: 60     # 60 seconds
      target: 30  # 30 seconds
    aspect_ratio: "9:16"
    orientation: "portrait"
    platform: "youtube-shorts"
    cross_post: ["tiktok", "instagram-reels"]
    script:
      template: "templates/scripts/shorts.md"
      sections:
        - hook          # 0-3sec: MUST grab attention immediately
        - content       # Single punchy point or reveal
        - payoff        # Satisfying conclusion or twist
        - cta_overlay   # Text overlay CTA (follow/subscribe)
      word_count:
        min: 30
        max: 120
    thumbnail:
      size: "1080x1920"
      text_limit: 3
      face_required: false
    seo:
      title_max_length: 40
      description_min_length: 50
      tags_min: 5
      tags_max: 15
      hashtags: 5

  promo:
    display_name: "プロモーション動画"
    description: "Product, service, or event promotional video"
    duration:
      min: 30     # 30 seconds
      max: 300    # 5 minutes
      target: 90  # 90 seconds
    aspect_ratio: "16:9"
    orientation: "landscape"
    variants: ["9:16", "1:1"]  # Also produce vertical and square cuts
    platform: "youtube"
    cross_post: ["website", "social-media", "email"]
    script:
      template: "templates/scripts/promo.md"
      sections:
        - hook          # 0-5sec: Problem or desire statement
        - problem       # Pain point amplification
        - solution      # Product/service introduction
        - features      # Key benefits (not features)
        - social_proof  # Testimonials, numbers, trust signals
        - offer         # Specific offer/CTA
        - urgency       # Time limit or scarcity
      word_count:
        min: 75
        max: 750
    thumbnail:
      size: "1280x720"
      text_limit: 4
      face_required: false
    seo:
      title_max_length: 60
      description_min_length: 150
      tags_min: 8
      tags_max: 25
      hashtags: 3
    compliance:
      sponsored_disclosure: true
      ftc_review: true
```

### 4.3 config/platforms.yaml

```yaml
# Platform Specifications
platforms:

  youtube:
    name: "YouTube"
    video:
      formats: ["mp4"]
      codec: "h264"
      max_size_gb: 256
      max_duration_hours: 12
      resolutions: ["2160p", "1440p", "1080p", "720p"]
      recommended_resolution: "1080p"
      frame_rates: [24, 25, 30, 50, 60]
      recommended_fps: 30
    thumbnail:
      format: "jpg"
      max_size_mb: 2
      resolution: "1280x720"
      min_width: 640
      aspect_ratio: "16:9"
    metadata:
      title_max: 100
      description_max: 5000
      tags_max: 500  # characters total
      category_required: true
      default_language: "ja"
    features:
      end_screens: true
      cards: true
      chapters: true
      community_posts: true
      playlists: true

  youtube-shorts:
    name: "YouTube Shorts"
    video:
      formats: ["mp4"]
      codec: "h264"
      max_duration_seconds: 60
      resolution: "1080x1920"
      aspect_ratio: "9:16"
      recommended_fps: 30
    metadata:
      title_max: 100
      description_max: 5000
      hashtag_shorts: true  # #Shorts tag
    features:
      music_overlay: true
      text_overlay: true

  tiktok:
    name: "TikTok"
    video:
      formats: ["mp4"]
      max_duration_seconds: 180
      resolution: "1080x1920"
      aspect_ratio: "9:16"
      recommended_fps: 30
    metadata:
      caption_max: 2200
      hashtags_max: 100
    features:
      duet: true
      stitch: true
      sounds: true

  instagram-reels:
    name: "Instagram Reels"
    video:
      formats: ["mp4"]
      max_duration_seconds: 90
      resolution: "1080x1920"
      aspect_ratio: "9:16"
      recommended_fps: 30
    metadata:
      caption_max: 2200
      hashtags_max: 30
    features:
      audio: true
      effects: true
      remix: true
```

### 4.4 config/quality-gates.yaml

```yaml
# Quality Gate Definitions
version: "1.0"

scoring:
  scale: 10
  pass_threshold: 8
  block_threshold: 5  # Below this = hard block

gates:

  research-completeness:
    phase: "1_research"
    checks:
      - id: "topic-depth"
        description: "Topic research covers minimum 5 credible sources"
        type: "count"
        target: 5
        field: "sources"
        severity: "block"
      - id: "competitor-coverage"
        description: "At least 3 competitor videos analyzed"
        type: "count"
        target: 3
        field: "competitors"
        severity: "block"
      - id: "keyword-primary"
        description: "Primary keyword identified with search volume"
        type: "exists"
        field: "primary_keyword"
        severity: "block"
      - id: "audience-defined"
        description: "Target audience persona is defined"
        type: "exists"
        field: "audience_persona"
        severity: "warn"
      - id: "brief-complete"
        description: "All required brief fields populated"
        type: "schema_valid"
        schema: "brief.yaml"
        severity: "block"

  script-review:
    phase: "2_script"
    checks:
      - id: "hook-score"
        description: "Hook grabs attention within time limit for video type"
        type: "score"
        target: 8
        reviewer: "critic"
        severity: "block"
      - id: "length-compliance"
        description: "Script word count within video type range"
        type: "range"
        field: "word_count"
        severity: "block"
      - id: "structure-complete"
        description: "All required sections present per video type template"
        type: "sections_present"
        severity: "block"
      - id: "key-messages"
        description: "All key messages from brief addressed in script"
        type: "coverage"
        source: "brief.key_messages"
        target: "script"
        severity: "warn"
      - id: "readability"
        description: "Script readable at target audience level"
        type: "score"
        target: 7
        severity: "warn"
      - id: "cta-present"
        description: "Call-to-action present in correct position"
        type: "exists"
        field: "cta"
        severity: "block"

  visual-completeness:
    phase: "3_visual"
    checks:
      - id: "storyboard-coverage"
        description: "Every script section has storyboard entry"
        type: "mapping_complete"
        source: "script.sections"
        target: "storyboard.scenes"
        severity: "block"
      - id: "asset-sourced"
        description: "All assets have identified source and license"
        type: "fields_present"
        fields: ["source", "license"]
        severity: "block"
      - id: "thumbnail-variants"
        description: "At least 3 thumbnail concepts created"
        type: "count"
        target: 3
        field: "thumbnail_concepts"
        severity: "warn"
      - id: "mobile-legibility"
        description: "Thumbnail text legible at 168x94px"
        type: "manual_check"
        severity: "block"
      - id: "contrast-ratio"
        description: "Thumbnail meets WCAG AA contrast ratio"
        type: "accessibility"
        standard: "WCAG-AA"
        severity: "warn"

  production-check:
    phase: "4_production"
    checks:
      - id: "edl-complete"
        description: "EDL covers all storyboard scenes"
        type: "mapping_complete"
        source: "storyboard.scenes"
        target: "edl.entries"
        severity: "block"
      - id: "caption-sync"
        description: "Caption timestamps align with script"
        type: "sync_check"
        tolerance_ms: 500
        severity: "warn"
      - id: "music-licensed"
        description: "All music selections have valid license"
        type: "fields_present"
        fields: ["license_type", "license_id"]
        severity: "block"
      - id: "asset-resolution"
        description: "All asset references resolve to existing files"
        type: "file_exists"
        severity: "block"

  publish-readiness:
    phase: "5_qa"
    checks:
      - id: "all-gates-passed"
        description: "All previous quality gates passed"
        type: "gates_passed"
        gates: ["research-completeness", "script-review", "visual-completeness", "production-check"]
        severity: "block"
      - id: "copyright-clear"
        description: "No copyright issues identified"
        type: "review_passed"
        reviewer: "security-reviewer"
        severity: "block"
      - id: "compliance-ok"
        description: "FTC/COPPA compliance verified (if applicable)"
        type: "conditional_review"
        condition: "is_sponsored"
        reviewer: "compliance"
        severity: "block"
      - id: "risk-acceptable"
        description: "Risk assessment is GREEN or YELLOW"
        type: "risk_level"
        acceptable: ["green", "yellow"]
        severity: "block"
      - id: "captions-present"
        description: "Japanese captions present and complete"
        type: "file_exists"
        path: "edit/captions/ja.srt"
        severity: "block"

  publish-final:
    phase: "6_publish"
    checks:
      - id: "metadata-complete"
        description: "Title, description, tags, category all present"
        type: "fields_present"
        fields: ["title", "description", "tags", "category"]
        severity: "block"
      - id: "thumbnail-ready"
        description: "Final thumbnail exported in correct format"
        type: "file_exists"
        path: "visual/thumbnail/final/"
        severity: "block"
      - id: "schedule-confirmed"
        description: "Publish date/time confirmed"
        type: "exists"
        field: "publish_datetime"
        severity: "block"
      - id: "cross-platform"
        description: "Cross-platform distribution plan present (if applicable)"
        type: "conditional_exists"
        condition: "has_cross_post"
        field: "distribution_plan"
        severity: "warn"
```

### 4.5 config/brand/brand-guide.yaml

```yaml
# Brand Guide (Customize per channel)
version: "1.0"

identity:
  channel_name: "{{CHANNEL_NAME}}"
  tagline: "{{TAGLINE}}"
  language: "ja"
  secondary_languages: ["en"]

voice:
  tone:
    primary: "informative"       # informative, entertaining, inspirational, authoritative
    secondary: "approachable"    # approachable, professional, casual, energetic
  personality:
    - "Explains complex topics simply"
    - "Uses analogies and real-world examples"
    - "Encourages curiosity"
    - "Avoids unnecessary jargon"
  language_style:
    formality: "semi-formal"     # formal, semi-formal, casual
    person: "first-plural"       # first-singular, first-plural, second, third
    sentence_length: "mixed"     # short, mixed, long
    humor: "light"               # none, light, moderate, heavy

visual:
  primary_colors:
    - name: "Main"
      hex: "#2563EB"
    - name: "Accent"
      hex: "#F59E0B"
    - name: "Dark"
      hex: "#1E293B"
    - name: "Light"
      hex: "#F8FAFC"
  typography:
    headings: "Noto Sans JP Bold"
    body: "Noto Sans JP Regular"
    accent: "Noto Sans JP Medium"
  thumbnail_style:
    background: "gradient-dark"
    text_position: "center-left"
    max_words: 5
    emoji_usage: "minimal"
    border: false

content:
  intro_pattern: "question-hook"   # question-hook, stat-hook, story-hook, bold-claim
  outro_pattern: "recap-cta"       # recap-cta, teaser-next, community-question
  cta_style: "soft"                # soft, direct, urgent
  chapter_markers: true
  pinned_comment: true
  end_screen_duration_seconds: 20
```

### 4.6 .claude/settings.json (Hooks & Permissions)

```json
{
  "permissions": {
    "allow": [
      "Read(projects/**)",
      "Read(config/**)",
      "Read(templates/**)",
      "Read(knowledge-base/**)",
      "Read(assets/**)",
      "Write(projects/**)",
      "Write(.omc/**)",
      "Write(config/**)",
      "Write(templates/**)",
      "Bash(tools/scripts/*)"
    ],
    "deny": [
      "Write(assets/music/**)",
      "Write(assets/stock/**)"
    ]
  },
  "hooks": {
    "on_project_create": {
      "description": "Initialize new video project from template",
      "trigger": "new project",
      "action": "Bash(tools/scripts/new-project.sh {{VIDEO_TYPE}} {{TOPIC}})"
    },
    "on_phase_complete": {
      "description": "Run quality gate after each phase",
      "trigger": "phase complete",
      "action": "Run quality-gate check for completed phase"
    },
    "pre_publish": {
      "description": "Final verification before publishing",
      "trigger": "before publish",
      "action": "Run verifier agent on all project artifacts"
    }
  },
  "model_preferences": {
    "research": "opus",
    "writing_draft": "haiku",
    "writing_review": "opus",
    "visual": "sonnet",
    "production": "sonnet",
    "quality": "opus",
    "publish": "sonnet"
  }
}
```

---

## 5. Work Objectives (Implementation Plan)

### Step 1: Scaffold Directory Structure
**Acceptance Criteria:**
- All directories from Section 1 exist
- Placeholder README in each major directory explaining its purpose
- `tools/scripts/new-project.sh` creates a project workspace from template

### Step 2: Create Configuration Files
**Acceptance Criteria:**
- All YAML configs from Section 4 are in place and valid YAML
- `pipeline.yaml` defines all 7 phases with agents, inputs, outputs, quality gates
- `video-types.yaml` has specs for all 4 video types
- `brand-guide.yaml` has placeholder values ready for customization

### Step 3: Build Templates
**Acceptance Criteria:**
- Script templates exist for all 4 video types with section markers
- Storyboard templates define scene structure per video type
- Description/tag templates include SEO best practices
- Thumbnail style templates reference brand guide

### Step 4: Write CLAUDE.md and AGENTS.md
**Acceptance Criteria:**
- CLAUDE.md contains project instructions per Section 3
- AGENTS.md documents all 34 agent assignments per Section 2
- Agent routing rules are clear and non-overlapping

### Step 5: Create Project Initialization Script
**Acceptance Criteria:**
- `new-project.sh` accepts video_type and topic, creates full project workspace
- Project workspace follows the per-project directory structure from Section 1
- `brief.yaml` is pre-populated with template variables

### Step 6: Establish Knowledge Base
**Acceptance Criteria:**
- `best-practices.md` covers YouTube algorithm essentials
- `audience-personas.yaml` has 3-5 starter personas
- Style guides provide actionable guidance for narration, visual, and editing

---

## Success Criteria
- A new video project of any type can be initialized in under 30 seconds
- Every phase has clear agent assignments and quality gates
- The pipeline is genre-agnostic: works for tech, cooking, finance, gaming, etc.
- All 34 OMC agents have defined, non-redundant roles
- Templates accelerate production without constraining creativity
