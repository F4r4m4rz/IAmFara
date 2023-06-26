import { useMobile } from 'src/utils/mediaQueries';
import { ContainerDiv, WelcomeText } from './styles';

export function HomePage() {
  const isMobile = useMobile();

  return (
    <ContainerDiv>
      <WelcomeText
        growOnHover={true}
        className={isMobile ? 'mobile' : undefined}
      >
        <p>Welcome to my website!</p>
        <p>
          I´m Faramarz Bodaghi, a passionate developer experienced in both
          front-end and back-end technologies. Here, you'll find insights into
          my professional journey, as well as a collection of thought-provoking
          blogs.
        </p>
        <p>
          With a constant thirst for knowledge, I stay up-to-date with the
          latest industry trends and embrace new technologies. My goal is to
          create innovative solutions and push the boundaries of what's
          possible.
        </p>
        <p>
          Explore my website to delve into my professional life, gain valuable
          insights, and embark on a journey of discovery. Feel free to reach out
          to me if you have any inquiries or if my work sparks your interest.
        </p>
        <p>
          Thank you for visiting, and I look forward to connecting with you!
        </p>
      </WelcomeText>
    </ContainerDiv>
  );
}
