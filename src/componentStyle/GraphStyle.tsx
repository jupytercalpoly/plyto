import { style } from 'typestyle';

export const GraphContainerStyle = style({
  paddingTop: '35px',
  width: '50%'
});

export function StatsContainerStyle(done) {
  if (done) {
    return style({
      width: '100%',
      display: 'block',
      margin: '15px 0px 0px 0px'
    });
  } else {
    return style({
      width: '100%',
      display: 'block',
      margin: '15px 0px 17px 0px'
    });
  }
}

export const StatContainerStyle = style({
  width: '100%',
  display: 'flex',
  marginBottom: '2px'
});

export const LabelStyle = style({
  width: '150px',
  boxSizing: 'border-box',
  marginLeft: '75px',
  display: 'flex',

  $nest: {
    '& .stat-label': {
      display: 'flex'
    },

    '& .stat': {
      width: '50px',
      lineHeight: '20px',
      textAlign: 'right'
    },

    '& .final-avg': {
      lineHeight: '20px'
    }
  }
});

export const StatStyle = style({
  display: 'inherit'
});

export const GraphStyle = style({
  margin: '25px'
});
