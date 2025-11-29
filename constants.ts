import { PromptBlock, Workflow } from './types';

export const CATEGORIES: { [key: string]: string } = {
  Discovery: 'bg-blue-500',        // Deep Blue
  Analysis: 'bg-cyan-500',         // Technical Cyan
  Recommendations: 'bg-indigo-500', // Strategic Indigo
  Implementation: 'bg-slate-500',   // Solid Slate
  Evaluation: 'bg-teal-500',       // Growth Teal
};

export const MOCK_LIBRARY: PromptBlock[] = [
  {
    id: 'blk_1',
    title: 'Interview Summary',
    category: 'Discovery',
    description: 'Synthesizes key themes from expert calls.',
    iconName: 'Mic',
    defaultPrompt: 'Analyze the attached transcript. Identify the top 3 recurring pain points, 2 surprising insights, and extract any mention of budget constraints. Format the output as a structured executive summary.',
    estimatedTime: '2m',
    inputRequirements: ['Transcript (PDF/TXT)', 'Meeting Notes']
  },
  {
    id: 'blk_2',
    title: 'Market Scan',
    category: 'Discovery',
    description: 'Broad analysis of market size and trends.',
    iconName: 'Globe',
    defaultPrompt: 'Perform a breakdown of the current market landscape for [TOPIC]. Include CAGR, major players, and regulatory headwinds. Use a Porter\'s Five Forces framework for the competitive intensity section.',
    estimatedTime: '5m',
    inputRequirements: ['Topic Keyword', 'Region']
  },
  {
    id: 'blk_3',
    title: 'ROI Matrix',
    category: 'Analysis',
    description: 'Calculates return on investment across scenarios.',
    iconName: 'BarChart3',
    defaultPrompt: 'Create a 3-scenario ROI model (Conservative, Base, Aggressive) for the proposed initiative. clearly state assumptions for each scenario regarding cost of capital and growth rates.',
    estimatedTime: '3m',
    inputRequirements: ['Cost Data', 'Revenue Projections']
  },
  {
    id: 'blk_4',
    title: 'Theme Extractor',
    category: 'Analysis',
    description: 'Identifies patterns in unstructured text data.',
    iconName: 'Search',
    defaultPrompt: 'Extract the top 5 strategic themes from the provided documents. For each theme, provide a confidence score and a representative quote.',
    estimatedTime: '4m',
    inputRequirements: ['Raw Documents', 'Survey Data']
  },
  {
    id: 'blk_5',
    title: 'Blueprint Creator',
    category: 'Recommendations',
    description: 'Drafts a strategic implementation roadmap.',
    iconName: 'Map',
    defaultPrompt: 'Generate a 90-day implementation blueprint with key milestones, owners, and resource requirements. Visualize the timeline as a text-based Gantt chart.',
    estimatedTime: '6m',
    inputRequirements: ['Strategy Doc', 'Timeline Constraints']
  },
  {
    id: 'blk_6',
    title: 'Deck Generator',
    category: 'Recommendations',
    description: 'Outlines slide structure for final readout.',
    iconName: 'Presentation',
    defaultPrompt: 'Create a 10-slide storyboard for the executive committee presentation. For each slide, define the headline, the visual format (chart/text), and the key message.',
    estimatedTime: '4m',
    inputRequirements: ['Key Insights', 'Data Charts']
  },
  {
    id: 'blk_7',
    title: 'Process Mining',
    category: 'Discovery',
    description: 'Analyzes event logs to identify bottlenecks.',
    iconName: 'Activity',
    defaultPrompt: 'Review the process flow data. Identify steps with highest latency and potential redundancy. Suggest 3 automation opportunities.',
    estimatedTime: '8m',
    inputRequirements: ['Event Logs (CSV)', 'Process Map']
  },
  {
    id: 'blk_8',
    title: 'RPA Bot Designer',
    category: 'Implementation',
    description: 'Drafts logic for automation bots.',
    iconName: 'Bot',
    defaultPrompt: 'Design the logic flow for an RPA bot to handle this manual data entry task. Include exception handling steps.',
    estimatedTime: '5m',
    inputRequirements: ['Task Description', 'Screen Recording']
  },
  {
    id: 'blk_9',
    title: 'Sentiment Analyzer',
    category: 'Evaluation',
    description: 'Gauges stakeholder sentiment post-launch.',
    iconName: 'Heart',
    defaultPrompt: 'Analyze customer feedback and categorize sentiment into Positive, Neutral, Negative with root causes. Create a word cloud of emotional keywords.',
    estimatedTime: '3m',
    inputRequirements: ['Feedback Dump', 'Social Mentions']
  }
];

export const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'wf_1',
    name: 'Market Entry - EV Charging',
    description: 'Strategic assessment for entering the US EV infrastructure market.',
    tags: ['Strategy', 'Energy', 'M&A'],
    lastModified: new Date('2023-10-24'),
    steps: [
      { 
        id: 's1', 
        blockId: 'blk_2', 
        status: 'completed', 
        output: 'Market size estimated at $12B with 15% CAGR.\n\nKey Players: ChargePoint, Tesla, EVgo.',
        reasoningTrace: 'Analyzed industry reports from 2023-2024. Cross-referenced CAGR with government infrastructure spending bills.'
      },
      { 
        id: 's2', 
        blockId: 'blk_3', 
        status: 'completed', 
        output: 'ROI positive in Year 4 under Base Case.\nIRR: 18%',
        reasoningTrace: 'Applied standard discount rate of 8%. Modeled 30% utilization rate ramp-up over 3 years.'
      },
      { id: 's3', blockId: 'blk_6', status: 'pending' }
    ]
  },
  {
    id: 'wf_2',
    name: 'Portfolio Ops Review',
    description: 'Quarterly operational efficiency check for Fund IV.',
    tags: ['Private Equity', 'Ops'],
    lastModified: new Date('2023-10-22'),
    steps: [
      { 
        id: 's1', 
        blockId: 'blk_1', 
        status: 'completed', 
        output: 'CEO interviews suggest alignment on cost cutting, but concern over talent retention.',
        reasoningTrace: 'Synthesized 5 hours of transcripts. Sentiment analysis showed high anxiety regarding "Headcount" topics.'
      },
      { id: 's2', blockId: 'blk_4', status: 'running' }
    ]
  }
];