<?php

namespace App\Services;

use App\Models\Document;
use App\Models\Project;

class AiDocsGeneratorPrompt
{
  /**
   * Create a new class instance.
   */
  public function __construct()
  {
    //
  }



  public function overview(Project $project): string
  {
    $baseTemplate = $project->enhanced_mode ?
      "Generate professional documentation in clean semantic HTML optimized for Tiptap. Use this exact structure without repeating project-details sections:\n" :
      "Generate complete project documentation in clean semantic HTML using this exact structure without repeating project-details sections:\n";

    return $baseTemplate . "
<div class='project-documentation'>
  <section class='project-overview'>
    <h2>Project Overview</h2>
    <p>Clear description of purpose and value</p>
  </section>

  <section class='tech-stack'>
    <h2>Tech Stack</h2>
    <p>Detailed technology recommendations</p>
  </section>

  <section class='features'>
    <h2>Features</h2>
    <p>Comprehensive feature breakdown</p>
    <ul>
        <li>List all the Feature one by one</li>
    </ul>
  </section>

  <section class='platform-recommendation'>
    <h2>Platform Recommendation</h2>
    <p>Web/mobile/hybrid analysis</p>
  </section>

  <section class='project-details'>
    <h2>Project Details</h2>
    <div class='detail-grid'>
      <div class='detail-item'><strong>Name:</strong> {$project->name}</div>
      <div class='detail-item'><strong>Idea:</strong> {$project->project_idea}</div>" .
      ($project->tech_stack ? "<div class='detail-item'><strong>Tech Stack:</strong> {$project->tech_stack}</div>" : "") .
      "<div class='detail-item'><strong>Key Features:</strong> {$project->features}</div>" .
      ($project->target_audience ? "<div class='detail-item'><strong>Target Audience:</strong> {$project->target_audience}</div>" : "") . "
    </div>
  </section>
</div>

Important instructions:
1. Use ONLY this structure - don't add extra sections
2. Never repeat the project details
3. Keep all headers centered
4. Maintain the grid layout for details
5. Return pure HTML without Markdown wrappers
6.  All headers (h2, h3, h4) centered
";
  }


  public function overviewDocsAiEdit(Document $document, string $prompt): string
  {
    $baseTemplate = $document->enhanced_mode
      ? "You are an expert technical writer. Improve the following HTML content based on this instruction:\n\"$prompt\"\n\nReturn cleaned, professional, and semantic HTML only:\n"
      : "Revise the HTML content below based on the instruction:\n\"$prompt\"\n\nEnsure the result is clean and optimized for Tiptap. Return only valid HTML:\n";

    return $baseTemplate . "\n" . $document->content;
  }


  public function generateTechnicalDocs(Project $project): string
  {
    $baseTemplate = $project->enhanced_mode ?
      "Generate comprehensive technical documentation in semantic HTML optimized for Tiptap, derived from the project overview. Follow this exact structure:\n" :
      "Generate complete technical documentation in semantic HTML using this exact structure:\n";

    return $baseTemplate . <<<HTML
<div class="technical-documentation">
  <section class="system-architecture">
    <h2>System Architecture</h2>
    <div class="architecture-diagram">
      <p>High-level diagram description showing:</p>
      <ul>
        <li>Component relationships</li>
        <li>Data flow directions</li>
        <li>Integration points</li>
      </ul>
    </div>
    
    <h3>Key Components</h3>
    <div class="component-grid">
      <div class="component">
        <strong>Frontend</strong>
        <p>Structure and framework details</p>
      </div>
      <div class="component">
        <strong>Backend</strong>
        <p>Service architecture and APIs</p>
      </div>
      <div class="component">
        <strong>Database</strong>
        <p>Schema design and ORM</p>
      </div>
    </div>
  </section>

  <section class="api-specifications">
    <h2>API Specifications</h2>
    <div class="endpoint">
      <h3>REST Endpoints</h3>
      <div class="endpoint-details">
        <table>
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Method</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>/api/resource</td>
              <td>GET</td>
              <td>Retrieve resource data</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <h3>Request/Response Examples</h3>
    <div class="code-examples">
      <pre class="request">// Sample request</pre>
      <pre class="response">// Sample response</pre>
    </div>
  </section>

  <section class="data-models">
    <h2>Data Models</h2>
    <div class="entity">
      <h3>User Entity</h3>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>id</td>
            <td>UUID</td>
            <td>Unique identifier</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="development-guide">
    <h2>Development Guide</h2>
    <div class="setup">
      <h3>Environment Setup</h3>
      <ol>
        <li>Installation steps</li>
        <li>Configuration requirements</li>
      </ol>
    </div>
    
    <div class="workflow">
      <h3>Workflow Processes</h3>
      <ul>
        <li>Branching strategy</li>
        <li>Commit conventions</li>
      </ul>
    </div>
  </section>

  {$this->projectDetailsSection($project)}
</div>

<!-- STRICT GENERATION RULES -->
1. MAINTAIN this exact section structure
2. Keep all headings centered (h2-h4)
3. Use semantic HTML5 elements
4. Reference these technologies from project details: {$project->tech_stack}
5. For enhanced mode:
   - Include cross-references to overview features
   - Add "See Overview" links where applicable
6. Omit Markdown completely
7. Include all section headers even if empty
8. Tables must use the provided structure

<!-- CONTENT REQUIREMENTS -->
- Use technical but clear language
- Provide concrete examples
- Maintain consistency with overview
- Include all essential technical details
- Format code examples properly
HTML;
  }

  protected function projectDetailsSection(Project $project): string
  {
    return <<<HTML
<section class="project-details">
  <h2>Technical Specifications</h2>
  <div class="spec-grid">
    <div class="spec-item"><strong>Project Name:</strong> {$project->name}</div>
    <div class="spec-item"><strong>Core Technology Stack:</strong> {$project->tech_stack}</div>
    <div class="spec-item"><strong>Key Technical Requirements:</strong> {$project->features}</div>
    <div class="spec-item"><strong>Architecture Style:</strong> [AI to determine]</div>
    <div class="spec-item"><strong>Scalability Considerations:</strong> [AI to analyze]</div>
  </div>
</section>
HTML;
  }


  public function generateUiUxDocs(Project $project): string
  {
    $baseTemplate = $project->enhanced_mode ?
      "Generate professional UI/UX documentation in semantic HTML optimized for Tiptap, derived from the project overview. Follow this exact structure:\n" :
      "Generate complete UI/UX documentation in semantic HTML using this exact structure:\n";

    return $baseTemplate . <<<HTML
<div class="uiux-documentation">
  <section class="design-system">
    <h2>Design System</h2>
    <div class="design-tokens">
      <h3>Design Tokens</h3>
      <div class="token-grid">
        <div class="token-category">
          <strong>Colors</strong>
          <div class="color-palette">
            <div class="color-swatch" style="background-color: #3366ff;">
              <span>Primary (#3366FF)</span>
            </div>
            <!-- Additional color swatches -->
          </div>
        </div>
        <div class="token-category">
          <strong>Typography</strong>
          <ul>
            <li>Font family: {$this->getRecommendedFonts($project)}</li>
            <li>Heading hierarchy</li>
          </ul>
        </div>
      </div>
    </div>
    
    <h3>Component Library</h3>
    <table class="component-table">
      <thead>
        <tr>
          <th>Component</th>
          <th>Usage</th>
          <th>States</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Primary Button</td>
          <td>Main actions</td>
          <td>Default, Hover, Active, Disabled</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="user-flows">
    <h2>User Flows</h2>
    <div class="flow-section">
      <h3>Key User Journeys</h3>
      <ol>
        <li>
          <strong>Onboarding Flow</strong>
          <p>Steps: Signup → Verification → Dashboard</p>
        </li>
      </ol>
    </div>
    
    <div class="wireframes">
      <h3>Wireframe References</h3>
      <div class="wireframe-grid">
        <div class="wireframe">
          <strong>Dashboard View</strong>
          <p>Key elements layout</p>
        </div>
      </div>
    </div>
  </section>

  <section class="accessibility">
    <h2>Accessibility Standards</h2>
    <div class="a11y-requirements">
      <ul>
        <li>WCAG 2.1 AA Compliance</li>
        <li>Keyboard navigation flow</li>
        <li>Screen reader considerations</li>
      </ul>
    </div>
  </section>

  <section class="prototyping">
    <h2>Prototyping Guidelines</h2>
    <div class="prototype-details">
      <h3>Fidelity Levels</h3>
      <div class="fidelity-levels">
        <div class="level">
          <strong>Low-Fi</strong>
          <p>Wireframe sketches</p>
        </div>
        <div class="level">
          <strong>Hi-Fi</strong>
          <p>Interactive prototypes</p>
        </div>
      </div>
    </div>
  </section>

  {$this->uiUxProjectDetailsSection($project)}
</div>

<!-- STRICT GENERATION RULES -->
1. MAINTAIN this exact section structure
2. All headings centered (h2-h4)
3. Use semantic HTML5 elements
4. Reference these from project details:
   - Target audience: {$project->target_audience}
   - Key features: {$project->features}
5. For enhanced mode:
   - Include references to overview tech stack
   - Add design rationale explanations
6. Omit Markdown completely
7. Include all section headers
8. Tables must use the provided structure

<!-- CONTENT REQUIREMENTS -->
- Use clear visual design language
- Include specific measurements (px/rem)
- Provide interaction details
- Maintain mobile-first approach
- Include accessibility considerations
HTML;
  }

  protected function uiUxProjectDetailsSection(Project $project): string
  {
    return <<<HTML
<section class="uiux-project-details">
  <h2>UI/UX Specifications</h2>
  <div class="spec-grid">
    <div class="spec-item"><strong>Project Name:</strong> {$project->name}</div>
    <div class="spec-item"><strong>Target Devices:</strong> [AI to determine]</div>
    <div class="spec-item"><strong>Primary User Roles:</strong> {$project->target_audience}</div>
    <div class="spec-item"><strong>Key User Flows:</strong> [Derived from features]</div>
    <div class="spec-item"><strong>Design Tools:</strong> [AI to recommend]</div>
  </div>
</section>
HTML;
  }

  protected function getRecommendedFonts(Project $project): string
  {
    // Logic to recommend fonts based on project type
    return "Inter, system-ui, sans-serif";
  }
}
