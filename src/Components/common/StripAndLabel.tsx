import {Platform, View} from 'react-native';
import Svg, {Line} from 'react-native-svg';
import {
  StripAndLabelProps,
  getTopAndLeftForStripAndLabel,
} from 'gifted-charts-core';

export const StripAndLabel = (props: StripAndLabelProps & { initialSpacing?: number }) => {
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
    containerHeight,
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
    initialSpacing, // <-- récupéré
  } = props;

  // Corrige le double comptage d'initialSpacing côté Web
  const pointerXFixed =
      Platform.OS === 'web' && typeof initialSpacing === 'number'
          ? pointerX - initialSpacing
          : pointerX;

  const {top, left} = getTopAndLeftForStripAndLabel({
    ...props,
    // Optionnel : si le core réutilise initialSpacing pour le label,
    // on peut aussi lui passer 0 sur Web pour éviter une autre double prise en compte :
    ...(Platform.OS === 'web' ? { initialSpacing: 0 } : null),
  });

  if (isNaN(top) || typeof top !== 'number') return null;

  return (
      <View style={{ position: 'absolute', top: pointerYLocal }}>
        {(isBarChart ? showPointerStrip && !pointerLabelComponent : showPointerStrip) ? (
            <View
                style={{
                  position: 'absolute',
                  left: -pointerStripWidth / 4,
                  top: containsNegative ? 0 : -pointerYLocal + 8 + xAxisThickness,
                  width,
                  height: containerHeight,
                }}>
              <Svg>
                <Line
                    stroke={pointerStripColor}
                    strokeWidth={pointerStripWidth}
                    strokeDasharray={
                      pointerConfig?.strokeDashArray ? pointerConfig?.strokeDashArray : ''
                    }
                    x1={
                        pointerXFixed +
                        pointerRadius +
                        2 -
                        pointerStripWidth / 2 +
                        (pointerItemLocal[0]?.pointerShiftX || 0)
                    }
                    y1={
                      pointerStripUptoDataPoint
                          ? pointerYLocal + pointerRadius - 4
                          : containerHeight - pointerStripHeight
                    }
                    x2={
                        pointerXFixed +
                        pointerRadius +
                        2 -
                        pointerStripWidth / 2 +
                        (pointerItemLocal[0]?.pointerShiftX || 0)
                    }
                    y2={containerHeight}
                />
                {horizontalStripConfig && (
                    <Line
                        stroke={horizontalStripConfig.color ?? pointerStripColor}
                        strokeWidth={horizontalStripConfig.thickness ?? pointerStripWidth}
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
                              ? pointerXFixed + 2
                              : screenWidth
                        }
                        y2={pointerYLocal - 7}
                    />
                )}
              </Svg>
              {horizontalStripConfig?.labelComponent ? (
                  <View
                      pointerEvents={pointerEvents ?? 'none'}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top:
                            pointerYLocal -
                            3 -
                            (horizontalStripConfig.labelComponentHeight ?? 30) / 2,
                        width: pointerLabelWidth,
                      }}>
                    {horizontalStripConfig.labelComponent(
                        hasDataSet ? pointerItemsForSet : pointerItemLocal,
                        hasDataSet ? secondaryPointerItemsForSet : [secondaryPointerItem],
                        pointerIndex,
                    )}
                  </View>
              ) : null}
            </View>
        ) : null}

        {pointerLabelComponent ? (
            <View
                pointerEvents={pointerEvents ?? 'none'}
                style={{
                  position: 'absolute',
                  left: left + pointerXFixed, // <-- utilise pointerX corrigé
                  top: top,
                  marginTop: pointerStripUptoDataPoint ? 0 : containerHeight - pointerStripHeight,
                  width: pointerLabelWidth,
                }}>
              {pointerLabelComponent(
                  hasDataSet ? pointerItemsForSet : pointerItemLocal,
                  hasDataSet ? secondaryPointerItemsForSet : [secondaryPointerItem],
                  pointerIndex,
              )}
            </View>
        ) : null}
      </View>
  );
};
