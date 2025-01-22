import { useState, useEffect } from "react";
import { Box, Icon } from "@mui/material";

interface SendingIndicatorProps {
  animate: boolean;
  onAnimationComplete?: () => void;
}

const DELAY_MIN = 300;
const DELAY_MAX = 800;
const DELAY_MULTI = 1.5;

export const SendingIndicator: React.FC<SendingIndicatorProps> = ({
  animate,
  onAnimationComplete,
}) => {
  const [tick1, setTick1] = useState(false);
  const [tick2, setTick2] = useState(false);

  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;

    if (animate) {
      timer1 = setTimeout(() => {
        setTick1(true);

        timer2 = setTimeout(() => {
          setTick2(true);
          timer3 = setTimeout(() => {
            onAnimationComplete?.();
          }, Math.floor(Math.random() * (DELAY_MAX * DELAY_MULTI - DELAY_MIN * DELAY_MULTI + 1)) + DELAY_MIN * DELAY_MULTI);
        }, Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1)) + DELAY_MIN);
      }, Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1)) + DELAY_MIN);
    } else {
      setTick1(true);
      setTick2(true);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [animate]);

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 25,
        height: 25,
      }}
    >
      <Icon
        sx={{
          color: tick1 ? "primary.main" : null,
          fontSize: 15,
          position: "absolute",
          top: 3,
          left: 3,
        }}
      >
        done
      </Icon>
      <Icon
        sx={{
          color: tick2 ? "primary.main" : null,
          fontSize: 15,
          position: "absolute",
          top: 4,
          left: 8,
        }}
      >
        done
      </Icon>
    </Box>
  );
};
