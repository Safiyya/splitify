import { Flex, FlexProps, Progress } from "@chakra-ui/react";

interface ProgressBarProps extends FlexProps {
  progress: number;
  title: string;
}

const ProgressBar: React.FunctionComponent<ProgressBarProps> = ({
  progress,
  title,
  ...props
}) => {
  return (
    <Flex flexDirection="column" {...props}>
      {title}
      <Progress height="32px" value={progress} />
    </Flex>
  );
};

export default ProgressBar;
