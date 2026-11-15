import { NextRequest, NextResponse } from 'next/server';
import { fetchOsdrDatasets, HRP_RISK_MAP } from '@/lib/nasa-osdr';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;

    const { datasets, source, attribution } = await fetchOsdrDatasets(category);

    return NextResponse.json({
      success: true,
      datasets,
      hrpRisks: HRP_RISK_MAP,
      source,
      attribution,
      cipherIntegration: {
        title: 'NASA CIPHER (Complement of Integrated Protocols for Human Exploration Research)',
        description: 'CIPHER is the first multi-discipline, multi-mission project integrating dozens of human research experiments across entire astronaut cohorts on the ISS and Lunar Gateway before long-duration Mars transit missions.',
        categories: ['Cardiovascular', 'Spaceflight-Associated Neuro-ocular Syndrome (SANS)', 'Bone & Muscle Loss', 'Immune & Microbiology', 'Behavioral Health & Performance'],
        sourceUrl: 'https://www.nasa.gov/about-cipher/'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
