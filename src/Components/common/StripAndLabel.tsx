import {Platform, View} from 'react-native';
import Svg, {Line} from 'react-native-svg';
import {
  StripAndLabelProps,
  getTopAndLeftForStripAndLabel,
} from 'gifted-charts-core';

export const StripAndLabel = (props: StripAndLabelProps & {svgHeight: number}) => {
  const {
    pointerX,
    pointerLabelWidth,
    pointerRadius,
    pointerWidth,
    pointerYLocal,
    pointerStripUptoDataPoint,
    pointerStripHeight,
    pointerItemLocal,
    showPointerStrip,
    pointerStripWidth,
    xAxisThickness,
    pointerStripColor,
    pointerConfig,
    pointerLabelComponent,
    secondaryPointerItem,
    pointerItemsForSet,
    secondaryPointerItemsForSet,
    pointerEvents,
    isBarChart,
    pointerIndex,
    hasDataSet,
    containsNegative,
    horizontalStripConfig,
    screenWidth,
    width,
    svgHeight,
    containerHeight
  } = props;

  const {top, left} = getTopAndLeftForStripAndLabel(props);

  if (isNaN(top)) return null;

  const drawHeight = (containerHeight ?? 0) + (xAxisThickness ?? 0);

// web half-pixel snap (odd stroke widths can render 0.5px off)
  const isWeb = Platform.OS === 'web';
  const halfPixelFix = isWeb && (pointerStripWidth % 2 === 1) ? 0.5 : 0;

// stop exactly on the axis line
  const bottomY = drawHeight - (pointerStripWidth / 2) - halfPixelFix;
  const y1Base  = Math.max(0, bottomY - (pointerStripHeight ?? 0));

  return (
    <View
      style={{
        position: 'absolute',
        top: pointerYLocal,
      }}>
      {(
        isBarChart
          ? showPointerStrip && !pointerLabelComponent
          : showPointerStrip
      ) ? (
        <View
          style={{
            position: 'absolute',
            left: -pointerStripWidth / 4,
            top: containsNegative ? 0 : -pointerYLocal + xAxisThickness,
            width,
            // hauteur identique à la zone SVG (inclut la zone sous l’axe X)
            height: drawHeight,
          }}>
          <Svg height={svgHeight} width={width}>
            <Line
              stroke={pointerStripColor}
              strokeWidth={pointerStripWidth}
              strokeDasharray={
                pointerConfig?.strokeDashArray
                  ? pointerConfig?.strokeDashArray
                  : ''
              }
              x1={
                pointerX +
                pointerRadius +
                2 -
                pointerStripWidth / 2 +
                (pointerItemLocal[0]?.pointerShiftX || 0)
              }
              y1={ pointerStripUptoDataPoint ? (pointerYLocal + pointerRadius - 4) : y1Base }
              x2={
                pointerX +
                pointerRadius +
                2 -
                pointerStripWidth / 2 +
                (pointerItemLocal[0]?.pointerShiftX || 0)
              }
              y2={bottomY}
              strokeLinecap="butt"
            />
            {horizontalStripConfig && (
              <Line
                stroke={horizontalStripConfig.color ?? pointerStripColor}
                strokeWidth={
                  horizontalStripConfig.thickness ?? pointerStripWidth
                }
                strokeDasharray={
                  (pointerConfig?.horizontalStripConfig?.strokeDashArray ??
                  pointerConfig?.strokeDashArray)
                    ? pointerConfig?.strokeDashArray
                    : ''
                }
                x1={0}
                y1={pointerYLocal - 7}
                x2={
                  horizontalStripConfig.horizontalStripUptoDataPoint
                    ? pointerX + 2
                    : screenWidth
                }
                y2={pointerYLocal - 7}
              />
            )}
          </Svg>
          {horizontalStripConfig?.labelComponent ? (
            <View
              pointerEvents={pointerEvents ?? 'none'}
              style={[
                {
                  position: 'absolute',
                  left: 0,
                  top:
                    pointerYLocal -
                    3 -
                    (horizontalStripConfig.labelComponentHeight ?? 30) / 2,
                  width: pointerLabelWidth,
                },
              ]}>
              {horizontalStripConfig?.labelComponent?.(
                hasDataSet ? pointerItemsForSet : pointerItemLocal,
                hasDataSet
                  ? secondaryPointerItemsForSet
                  : [secondaryPointerItem],
                pointerIndex,
              )}
            </View>
          ) : null}
        </View>
      ) : null}

      {pointerLabelComponent ? (
        <View
          pointerEvents={pointerEvents ?? 'none'}
          style={[
            {
              position: 'absolute',
              left: left + pointerX,
              top: top,
              marginTop: pointerStripUptoDataPoint ? 0 : y1Base,
              width: pointerLabelWidth,
            },
          ]}>
          {pointerLabelComponent?.(
            hasDataSet ? pointerItemsForSet : pointerItemLocal,
            hasDataSet ? secondaryPointerItemsForSet : [secondaryPointerItem],
            pointerIndex,
          )}
        </View>
      ) : null}
    </View>
  );
};
