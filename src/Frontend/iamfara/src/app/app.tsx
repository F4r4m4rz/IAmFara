import styled from '@emotion/styled';

const Page = styled.main`
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(78, 93, 255, 0.16), transparent 32%),
    linear-gradient(180deg, #0b1020 0%, #111827 42%, #f8fafc 42%, #f8fafc 100%);
  color: #e5e7eb;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', sans-serif;
`;

const Container = styled.div`
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(14px);
  background: rgba(11, 16, 32, 0.72);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const Nav = styled(Container)`
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const Brand = styled.a`
  color: #ffffff;
  text-decoration: none;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.95rem;
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;

  a {
    color: #cbd5e1;
    text-decoration: none;
    font-size: 0.96rem;
  }

  a:hover {
    color: #ffffff;
  }
`;

const Hero = styled.section`
  padding: 88px 0 72px;
`;

const HeroGrid = styled(Container)`
  display: grid;
  grid-template-columns: 1.25fr 0.95fr;
  gap: 32px;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Eyebrow = styled.p`
  margin: 0 0 14px;
  color: #93c5fd;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.82rem;
  font-weight: 700;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.6rem, 6vw, 4.9rem);
  line-height: 0.96;
  letter-spacing: -0.04em;
  color: #ffffff;
`;

const Accent = styled.span`
  display: block;
  color: #93c5fd;
`;

const Lead = styled.p`
  margin: 24px 0 0;
  max-width: 640px;
  font-size: 1.1rem;
  line-height: 1.8;
  color: #cbd5e1;
`;

const Actions = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 32px;
`;

const PrimaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 0 20px;
  border-radius: 999px;
  background: linear-gradient(135deg, #60a5fa, #818cf8);
  color: #081120;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 18px 44px rgba(96, 165, 250, 0.28);
`;

const SecondaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 0 20px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #ffffff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.03);
`;

const HeroCard = styled.div`
  border-radius: 28px;
  padding: 28px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
`;

const Stat = styled.div`
  padding: 18px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);

  strong {
    display: block;
    font-size: 1.7rem;
    color: #ffffff;
    margin-bottom: 6px;
  }

  span {
    color: #cbd5e1;
    line-height: 1.5;
    font-size: 0.95rem;
  }
`;

const Section = styled.section`
  padding: 72px 0;
  color: #0f172a;
`;

const SectionHeader = styled.div`
  max-width: 720px;
  margin-bottom: 28px;

  h2 {
    margin: 0 0 12px;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  p {
    margin: 0;
    color: #475569;
    line-height: 1.8;
    font-size: 1.02rem;
  }
`;

const Grid = styled(Container)`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);

  h3 {
    margin: 0 0 12px;
    font-size: 1.15rem;
  }

  p {
    margin: 0;
    color: #475569;
    line-height: 1.75;
  }
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.9rem;
  font-weight: 700;
`;

const ContactSection = styled(Section)`
  padding-top: 16px;
  padding-bottom: 88px;
`;

const ContactCard = styled(Container)`
  background: linear-gradient(135deg, #0f172a, #172554);
  color: #ffffff;
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 26px 60px rgba(15, 23, 42, 0.2);

  h2 {
    margin: 0 0 12px;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.05;
  }

  p {
    margin: 0;
    max-width: 720px;
    color: #cbd5e1;
    line-height: 1.8;
  }
`;

const ContactActions = styled(Actions)`
  margin-top: 24px;
`;

const Footer = styled.footer`
  padding: 0 0 36px;
  color: #94a3b8;
  text-align: center;
  font-size: 0.95rem;
`;

export function App() {
  return (
    <Page>
      <Header>
        <Nav>
          <Brand href="#home">IAmFara</Brand>
          <NavLinks>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#skills">Skills</a>
            <a href="#contact">Contact</a>
          </NavLinks>
        </Nav>
      </Header>

      <Hero id="home">
        <HeroGrid>
          <div>
            <Eyebrow>Design. Build. Improve.</Eyebrow>
            <Title>
              Modern web experiences
              <Accent>for products that deserve better.</Accent>
            </Title>
            <Lead>
              IAmFara is a clean personal website focused on clarity, trust, and strong
              presentation. This rebuild turns the site into a modern portfolio-style landing
              page with a sharper visual identity and a much stronger first impression.
            </Lead>
            <Actions>
              <PrimaryButton href="#projects">See projects</PrimaryButton>
              <SecondaryButton href="#contact">Contact me</SecondaryButton>
            </Actions>
          </div>

          <HeroCard>
            <Eyebrow style={{ marginBottom: 10 }}>Why this version is better</Eyebrow>
            <Lead style={{ marginTop: 0, fontSize: '1rem' }}>
              A more premium layout, better spacing, stronger typography, and sections that
              tell visitors who you are and what you build.
            </Lead>
            <StatGrid>
              <Stat>
                <strong>01</strong>
                <span>Stronger first impression with a modern hero section.</span>
              </Stat>
              <Stat>
                <strong>02</strong>
                <span>Cleaner structure for projects, skills, and contact details.</span>
              </Stat>
              <Stat>
                <strong>03</strong>
                <span>Responsive layout that feels better on mobile and desktop.</span>
              </Stat>
              <Stat>
                <strong>04</strong>
                <span>Easy base to extend with real content later.</span>
              </Stat>
            </StatGrid>
          </HeroCard>
        </HeroGrid>
      </Hero>

      <Section id="about">
        <Container>
          <SectionHeader>
            <h2>About this rebuild</h2>
            <p>
              Instead of a placeholder app, this version gives you a polished website shell that
              can grow into a full personal brand site. It is intentionally simple, elegant, and
              easy to maintain.
            </p>
          </SectionHeader>
        </Container>

        <Grid>
          <Card>
            <h3>Clear structure</h3>
            <p>
              The page now has a proper flow: introduction, value, selected work, technical skills,
              and contact. Visitors understand the site faster.
            </p>
          </Card>
          <Card>
            <h3>Better visual quality</h3>
            <p>
              Rounded cards, layered backgrounds, improved contrast, and stronger spacing make the
              site feel more intentional and modern.
            </p>
          </Card>
          <Card>
            <h3>Good foundation</h3>
            <p>
              This is a clean starting point for adding your real projects, biography, case studies,
              and links without redesigning everything again.
            </p>
          </Card>
        </Grid>
      </Section>

      <Section id="projects">
        <Container>
          <SectionHeader>
            <h2>Selected sections for your future content</h2>
            <p>
              These cards can later be replaced with real work, apps, experiments, articles, or
              business ideas. For now they give the site a complete and professional structure.
            </p>
          </SectionHeader>
        </Container>

        <Grid>
          <Card>
            <h3>Featured project</h3>
            <p>
              Use this area for your strongest project with a short summary, stack, and direct link.
            </p>
            <TagRow>
              <Tag>Case study</Tag>
              <Tag>Product</Tag>
            </TagRow>
          </Card>
          <Card>
            <h3>Development work</h3>
            <p>
              Highlight apps, frontend builds, backend systems, or tools you have made and the
              value they delivered.
            </p>
            <TagRow>
              <Tag>Frontend</Tag>
              <Tag>Backend</Tag>
            </TagRow>
          </Card>
          <Card>
            <h3>Experiments</h3>
            <p>
              A place for AI ideas, design explorations, prototypes, or side projects that show how
              you think and build.
            </p>
            <TagRow>
              <Tag>AI</Tag>
              <Tag>Prototype</Tag>
            </TagRow>
          </Card>
        </Grid>
      </Section>

      <Section id="skills">
        <Container>
          <SectionHeader>
            <h2>Skills and tools</h2>
            <p>
              The rebuild also creates a simple place to present your stack. Right now it is generic,
              but it can be tailored to your exact profile in the next PR.
            </p>
          </SectionHeader>
          <TagRow>
            <Tag>React</Tag>
            <Tag>TypeScript</Tag>
            <Tag>Frontend UI</Tag>
            <Tag>Design Systems</Tag>
            <Tag>APIs</Tag>
            <Tag>Problem Solving</Tag>
          </TagRow>
        </Container>
      </Section>

      <ContactSection id="contact">
        <ContactCard>
          <h2>Let’s make the site truly yours</h2>
          <p>
            This PR focuses on replacing the placeholder experience with a visually strong base.
            The next improvement should be adding your real text, project data, links, and brand
            personality.
          </p>
          <ContactActions>
            <PrimaryButton href="mailto:me@iamfara.com">me@iamfara.com</PrimaryButton>
            <SecondaryButton href="#home">Back to top</SecondaryButton>
          </ContactActions>
        </ContactCard>
      </ContactSection>

      <Footer>
        Built for IAmFara — modern, simple, and ready for real content.
      </Footer>
    </Page>
  );
}

export default App;
