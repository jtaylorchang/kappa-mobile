import React from 'react';
import { StyleSheet, Dimensions, TouchableWithoutFeedback, ScrollView, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import { useSafeArea } from 'react-native-safe-area-context';
import moment from 'moment';
import { ProgressCircle } from 'react-native-svg-charts';

import { TRedux } from '@reducers';
import { _auth, _kappa } from '@reducers/actions';
import { log } from '@services/logService';
import { theme } from '@constants';
import { TabBarHeight, isEmpty } from '@services/utils';
import { TEvent } from '@backend/kappa';
import Block from '@components/Block';
import Ghost from '@components/Ghost';
import Text from '@components/Text';
import RoundButton from '@components/RoundButton';
import Icon from '@components/Icon';
import { getAttendance, getExcuse, getEventRecordCounts } from '@services/kappaService';

const { width, height } = Dimensions.get('screen');

const EventDrawer: React.FC<{}> = ({}) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const directorySize = useSelector((state: TRedux) => state.kappa.directorySize);
  const records = useSelector((state: TRedux) => state.kappa.records);
  const gettingAttendance = useSelector((state: TRedux) => state.kappa.gettingAttendance);
  const selectedEventId = useSelector((state: TRedux) => state.kappa.selectedEventId);
  const selectedEvent = useSelector((state: TRedux) => state.kappa.selectedEvent);

  const [refreshing, setRefreshing] = React.useState<boolean>(gettingAttendance);

  const dispatch = useDispatch();
  const dispatchGetAttendance = React.useCallback(
    () => dispatch(_kappa.getEventAttendance(user, selectedEventId.toString())),
    [dispatch, user, selectedEventId]
  );
  const dispatchGetMyAttendance = React.useCallback(() => dispatch(_kappa.getMyAttendance(user)), [dispatch, user]);
  const dispatchUnselectEvent = React.useCallback(() => dispatch(_kappa.unselectEvent()), [dispatch]);

  const insets = useSafeArea();

  const sheetRef = React.useRef(undefined);
  const scrollRef = React.useRef(undefined);

  const sheetHeight = Math.max((height - insets.top) * 0.67 + insets.bottom, 600);

  const [snapPoint, setSnapPoint] = React.useState<number>(1);
  const [callbackNode, setCallbackNode] = React.useState(new Animated.Value(0));

  const backgroundOpacity = callbackNode.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0]
  });

  const loadData = () => {
    if (user.privileged) {
      dispatchGetAttendance();
    } else {
      dispatchGetMyAttendance();
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    setTimeout(loadData, 500);
  }, [refreshing]);

  const snapTo = React.useCallback(
    newSnap => {
      sheetRef?.current?.snapTo(newSnap);
      sheetRef?.current?.snapTo(newSnap);
    },
    [sheetRef]
  );

  const onPressClose = React.useCallback(() => {
    snapTo(1);
  }, []);

  const attended = React.useMemo(() => {
    return getAttendance(records, user.email, selectedEventId.toString());
  }, [records, user, selectedEventId]);

  const excused = React.useMemo(() => {
    return getExcuse(records, user.email, selectedEventId.toString());
  }, [records, user, selectedEventId]);

  const recordCounts = React.useMemo(() => {
    return getEventRecordCounts(records, selectedEventId.toString());
  }, [records, selectedEventId]);

  const recordStats = React.useMemo(() => {
    const fraction = directorySize === 0 ? 0 : recordCounts.sum / directorySize;

    return {
      raw: fraction,
      percent: `${Math.round(fraction * 100)}%`
    };
  }, [recordCounts, directorySize]);

  const onOpenStart = () => {
    setSnapPoint(0);
  };

  const onOpenEnd = () => {
    setSnapPoint(0);
  };

  const onCloseStart = () => {
    setSnapPoint(1);
  };

  const onCloseEnd = () => {
    setSnapPoint(1);

    dispatchUnselectEvent();
  };

  React.useEffect(() => {
    if (!gettingAttendance) {
      setRefreshing(false);
    }
  }, [gettingAttendance]);

  React.useEffect(() => {
    if (selectedEventId === -1) {
      snapTo(1);
    } else {
      snapTo(0);

      loadData();
    }
  }, [selectedEventId]);

  const renderHeader = () => {
    return (
      <Block style={styles.header}>
        <Block style={styles.panelHeader}>
          <Block style={styles.panelHandle} />
        </Block>
      </Block>
    );
  };

  const renderContent = () => {
    return (
      <Block
        style={[
          styles.contentWrapper,
          {
            height: sheetHeight - 48
          }
        ]}
      >
        {selectedEvent !== null && (
          <React.Fragment>
            <ScrollView
              ref={ref => (scrollRef.current = ref)}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              scrollIndicatorInsets={{ right: 1 }}
            >
              <Block style={styles.eventWrapper}>
                <Block style={styles.eventHeader}>
                  <Text style={styles.eventDate}>{moment(selectedEvent.start).format('ddd LL h:mm A')}</Text>
                  <Text style={styles.eventTitle}>{selectedEvent.title}</Text>

                  {selectedEvent.mandatory === 1 && (
                    <Block style={styles.propertyWrapper}>
                      <Icon
                        style={styles.propertyIcon}
                        family="Feather"
                        name="alert-circle"
                        size={14}
                        color={theme.COLORS.PRIMARY}
                      />

                      <Text style={[styles.propertyText, { color: theme.COLORS.PRIMARY }]}>Mandatory</Text>
                    </Block>
                  )}
                  {attended !== undefined && (
                    <Block style={styles.propertyWrapper}>
                      <Icon
                        style={styles.propertyIcon}
                        family="Feather"
                        name="check"
                        size={14}
                        color={theme.COLORS.PRIMARY_GREEN}
                      />

                      <Text style={[styles.propertyText, { color: theme.COLORS.PRIMARY_GREEN }]}>Checked In</Text>
                    </Block>
                  )}
                  {excused !== undefined && excused.approved === 1 && (
                    <Block style={styles.propertyWrapper}>
                      <Icon
                        style={styles.propertyIcon}
                        family="Feather"
                        name="check"
                        size={14}
                        color={theme.COLORS.PRIMARY_GREEN}
                      />

                      <Text style={[styles.propertyText, { color: theme.COLORS.PRIMARY_GREEN }]}>Excused</Text>
                    </Block>
                  )}
                  {excused !== undefined && excused.approved === 0 && (
                    <Block style={styles.propertyWrapper}>
                      <Icon
                        style={styles.propertyIcon}
                        family="Feather"
                        name="clock"
                        size={14}
                        color={theme.COLORS.YELLOW_GRADIENT_END}
                      />

                      <Text style={[styles.propertyText, { color: theme.COLORS.YELLOW_GRADIENT_END }]}>
                        Excuse under review
                      </Text>
                    </Block>
                  )}
                </Block>

                <Block style={styles.eventBody}>
                  <Text style={styles.eventDescription}>{selectedEvent.description}</Text>

                  <Text style={styles.propertyHeader}>Location</Text>
                  <Text style={styles.propertyValue}>{selectedEvent.location}</Text>

                  <Block style={styles.splitPropertyRow}>
                    <Block style={styles.splitProperty}>
                      <Text style={styles.propertyHeader}>Duration</Text>
                      <Text style={styles.propertyValue}>{selectedEvent.duration} mins</Text>
                    </Block>
                    <Block style={styles.splitProperty}>
                      <Text style={styles.propertyHeader}>Points</Text>
                      <Text style={styles.propertyValue}>N/A</Text>
                    </Block>
                  </Block>

                  {user.privileged && (
                    <Block style={styles.adminContainer}>
                      <Block style={styles.circleChartContainer}>
                        <ProgressCircle
                          style={styles.circleChart}
                          progress={recordStats.raw}
                          progressColor={theme.COLORS.PRIMARY}
                          startAngle={-Math.PI * 0.8}
                          endAngle={Math.PI * 0.8}
                        />
                        <Block style={styles.circleChartLabels}>
                          <Text style={styles.circleChartValue}>{recordStats.percent}</Text>
                          <Text style={styles.circleChartTitle}>Headcount</Text>
                        </Block>
                      </Block>

                      <Block style={styles.chartPropertyContainer}>
                        <Block style={styles.chartProperty}>
                          <Text style={styles.chartPropertyLabel}>Attended</Text>
                          <Text style={styles.chartPropertyValue}>{recordCounts.attended}</Text>
                        </Block>
                        <Block style={styles.chartProperty}>
                          <Text style={styles.chartPropertyLabel}>Excused</Text>
                          <Text style={styles.chartPropertyValue}>{recordCounts.excused}</Text>
                        </Block>
                        <Block style={styles.chartProperty}>
                          <Text style={styles.chartPropertyLabel}>Pending</Text>
                          <Text style={styles.chartPropertyValue}>{recordCounts.pending}</Text>
                        </Block>
                      </Block>
                    </Block>
                  )}
                </Block>
              </Block>
            </ScrollView>

            <Block
              style={[
                styles.bottomBar,
                {
                  marginBottom: insets.bottom
                }
              ]}
            >
              {selectedEvent.excusable === 1 && (
                <React.Fragment>
                  <Block style={styles.excuseButton}>
                    <RoundButton
                      alt={true}
                      label="Request Excuse"
                      disabled={excused !== undefined || attended !== undefined}
                      onPress={() => log('TODO')}
                    />
                  </Block>
                  <Block style={styles.bottomDivider} />
                </React.Fragment>
              )}

              <Block style={styles.attendButton}>
                <RoundButton
                  disabled={attended !== undefined || moment(selectedEvent.start).isBefore(moment(), 'day')}
                  label="Check In"
                  onPress={() => log('TODO')}
                />
              </Block>
            </Block>
          </React.Fragment>
        )}
      </Block>
    );
  };

  return (
    <Ghost style={styles.container}>
      <TouchableWithoutFeedback onPress={onPressClose}>
        <Animated.View
          pointerEvents={selectedEventId === -1 ? 'none' : 'auto'}
          style={[
            styles.background,
            {
              opacity: backgroundOpacity
            }
          ]}
        />
      </TouchableWithoutFeedback>

      <BottomSheet
        ref={ref => (sheetRef.current = ref)}
        snapPoints={[sheetHeight, 0]}
        initialSnap={1}
        callbackNode={callbackNode}
        overdragResistanceFactor={1.5}
        enabledBottomClamp={true}
        renderHeader={renderHeader}
        renderContent={renderContent}
        onOpenStart={onOpenStart}
        onOpenEnd={onOpenEnd}
        onCloseStart={onCloseStart}
        onCloseEnd={onCloseEnd}
      />
    </Ghost>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  background: {
    flex: 1,
    backgroundColor: theme.COLORS.BLACK
  },
  header: {
    height: 48,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: theme.COLORS.WHITE
  },
  panelHeader: {
    alignItems: 'center'
  },
  panelHandle: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00000040'
  },
  headerControls: {
    flex: 1,
    marginHorizontal: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  contentWrapper: {
    backgroundColor: theme.COLORS.WHITE
  },
  eventWrapper: {
    paddingHorizontal: 24
  },
  eventHeader: {},
  eventDate: {
    fontFamily: 'OpenSans-Bold',
    color: theme.COLORS.GRAY,
    fontSize: 14,
    textTransform: 'uppercase'
  },
  eventTitle: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 24
  },
  propertyWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  propertyIcon: {},
  propertyText: {
    marginLeft: 4,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13
  },
  eventBody: {
    marginTop: 24
  },
  eventDescription: {
    marginBottom: 8,
    fontFamily: 'OpenSans',
    fontSize: 17
  },
  propertyHeader: {
    marginTop: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  propertyValue: {
    marginTop: 4,
    fontFamily: 'OpenSans',
    fontSize: 17
  },
  splitPropertyRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  splitProperty: {
    width: '50%'
  },
  adminContainer: {
    marginTop: 24,
    marginBottom: 24,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  circleChartContainer: {
    width: 144,
    height: 144
  },
  circleChart: {
    height: '100%'
  },
  circleChartLabels: {
    position: 'absolute',
    width: 144,
    height: 144,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleChartValue: {
    fontFamily: 'OpenSans',
    fontSize: 17
  },
  circleChartTitle: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  chartPropertyContainer: {
    flexGrow: 1,
    paddingLeft: 24,
    justifyContent: 'center'
  },
  chartProperty: {
    height: 42,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chartPropertyLabel: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 15,
    color: theme.COLORS.GRAY,
    textTransform: 'uppercase'
  },
  chartPropertyValue: {
    fontFamily: 'OpenSans',
    fontSize: 15
  },
  bottomBar: {
    width: '100%',
    height: 64,
    backgroundColor: theme.COLORS.WHITE,
    paddingHorizontal: 24,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  excuseButton: {
    flex: 1
  },
  bottomDivider: {
    width: 8
  },
  attendButton: {
    flex: 1
  }
});

export default EventDrawer;
