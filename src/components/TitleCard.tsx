import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { theme } from '@constants';
import Block from '@components/Block';
import Text from '@components/Text';

const TitleCard: React.FC<{
  title: string;
  button?: boolean;
  onPress?: () => void;
}> = ({ title, button = false, onPress = () => {}, children }) => {
  return (
    <TouchableOpacity style={styles.wrapper} activeOpacity={button ? 0.4 : 1} onPress={onPress}>
      <Block flex>
        <Text style={styles.title}>{title}</Text>
        {children}
      </Block>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
    padding: 10,
    borderRadius: 7,
    backgroundColor: theme.COLORS.WHITE,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowColor: theme.COLORS.BLACK,
    shadowOpacity: 0.2,
    elevation: 2
  },
  title: {
    fontFamily: 'OpenSans',
    fontSize: 20,
    color: theme.COLORS.DARK_GRAY
  }
});

export default TitleCard;
