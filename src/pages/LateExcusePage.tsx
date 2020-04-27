import React from 'react';
import { StyleSheet, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeArea } from 'react-native-safe-area-context';
import moment from 'moment';

import { TRedux } from '@reducers';
import { _kappa, _ui } from '@reducers/actions';
import { theme } from '@constants';
import { Block, Header, EndCapButton, ListButton, SlideModal, Text, RadioList } from '@components';
import { HeaderHeight } from '@services/utils';
import { TEvent } from '@backend/kappa';
import { getEventById, hasValidCheckIn, sortEventByDate } from '@services/kappaService';

const LateExcusePage: React.FC<{
  onRequestClose(): void;
}> = ({ onRequestClose }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const records = useSelector((state: TRedux) => state.kappa.records);
  const events = useSelector((state: TRedux) => state.kappa.events);
  const eventArray = useSelector((state: TRedux) => state.kappa.eventArray);

  const [choosingEvent, setChoosingEvent] = React.useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = React.useState<TEvent>(null);

  const insets = useSafeArea();

  const eventOptions = React.useMemo(() => {
    const now = moment();

    return eventArray
      .filter(event => moment(event.start).isBefore(now) && !hasValidCheckIn(records, user.email, event.id, true))
      .sort(sortEventByDate)
      .map(event => ({
        id: event.id,
        title: event.title,
        subtitle: moment(event.start).format('ddd LLL')
      }));
  }, [user, records.attended, records.excused, eventArray]);

  const onChangeEventList = React.useCallback(
    (chosen: string) => {
      setSelectedEvent(getEventById(events, chosen));
      setChoosingEvent(false);
    },
    [events]
  );

  const renderChoosingEvent = () => {
    return (
      <Block flex>
        <Header title="Choose an Event" showBackButton={true} onPressBackButton={() => setChoosingEvent(false)} />

        <Block
          style={[
            styles.wrapper,
            {
              top: insets.top + HeaderHeight
            }
          ]}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TouchableWithoutFeedback>
              <Block
                style={[
                  styles.content,
                  {
                    paddingBottom: insets.bottom
                  }
                ]}
              >
                {eventOptions.length > 0 ? (
                  <React.Fragment>
                    <Block style={styles.propertyHeaderContainer}>
                      <Text style={styles.propertyHeader}>Event</Text>
                    </Block>

                    <RadioList
                      options={eventOptions}
                      selected={selectedEvent ? selectedEvent.id : ''}
                      onChange={onChangeEventList}
                    />
                  </React.Fragment>
                ) : (
                  <Text style={styles.description}>
                    No events available to request an excuse for. This likely means you already requested excuses or
                    checked in for all the available past events. If the event hasn't happened yet or is today, please
                    use the check in page!
                  </Text>
                )}
              </Block>
            </TouchableWithoutFeedback>
          </ScrollView>
        </Block>
      </Block>
    );
  };

  return (
    <Block flex>
      <Header
        title="Special Request"
        showBackButton={true}
        onPressBackButton={onRequestClose}
        rightButton={<EndCapButton label="Submit" loading={false} />}
      />

      <Block
        style={[
          styles.wrapper,
          {
            top: insets.top + HeaderHeight
          }
        ]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableWithoutFeedback>
            <Block
              style={[
                styles.content,
                {
                  paddingBottom: insets.bottom
                }
              ]}
            >
              <Block style={styles.eventIdContainer}>
                <ListButton
                  keyText="Event"
                  valueText={selectedEvent === null ? 'choose one' : selectedEvent.title}
                  onPress={() => setChoosingEvent(true)}
                />
              </Block>
            </Block>
          </TouchableWithoutFeedback>
        </ScrollView>
      </Block>

      <SlideModal visible={choosingEvent}>{renderChoosingEvent()}</SlideModal>
    </Block>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  },
  scrollContent: {
    flexGrow: 1
  },
  content: {
    minHeight: '100%',
    paddingBottom: 64,
    paddingHorizontal: 24
  },
  eventIdContainer: {
    marginTop: 16
  },
  propertyHeaderContainer: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'row'
  },
  propertyHeader: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  description: {
    marginTop: 12,
    fontFamily: 'OpenSans',
    fontSize: 12
  }
});

export default LateExcusePage;
