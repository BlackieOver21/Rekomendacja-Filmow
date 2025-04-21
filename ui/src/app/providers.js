import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  colors: {
    'paleBlue' : [
      "#e9f2ff",
      "#d4e0fd",
      "#a9bef3",
      "#7b9ae9",
      "#547be1",
      "#3b68dc",
      "#2c5edb",
      "#1d4ec3",
      "#1445af",
      "#003b9c"
    ], 
    'dark' : [
      "#a6a7ab",
      "#8B8E94",
      "#767882",
      "#656670",
      "#50515C",
      "#40414D",
      "#2B2C36",
      "#1D1F27",
      "#17181F",
      "#0D0D14",
    ],
    'deepBlue': [
      "#d5dafb",
      "#a9b1f1",
      "#7a87e9",
      "#5362e1",
      "#3a4bdd",
      "#2c40dc",
      "#1f32c4",
      "#182cb0",
      "#0a259c",
      "#061D80",
    ]
  },
  primaryColor: 'paleBlue',
  primaryShade: { dark: 4 },
  
  // fontFamily: 'Inter, sans-serif',
});

export default function Providers({ children }) {
  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      {children}
    </MantineProvider>
  );
}
