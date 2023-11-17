import tw from 'twin.macro';

import { MusicLayout } from '@/Layout/Music';
import { Card } from '@/components/atoms/Card';

const HomePage: React.FC = () => {
  return (
    <MusicLayout css={[tw``]}>
      Home
      <div>
        <Card>123</Card>
      </div>
    </MusicLayout>
  );
};

export default HomePage;
