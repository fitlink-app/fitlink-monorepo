import React, {FC} from 'react';
import {Icon, Navbar} from '@components';
import {StyleSheet} from 'react-native';

export interface IAnimatedHeaderCardNavbarProps {
  title: string;
  isNavbarRightVisible?: boolean;
  onNavbarRightPress?: () => unknown;
}

export const HeaderCardNavbar: FC<IAnimatedHeaderCardNavbarProps> = ({
  title,
  isNavbarRightVisible,
  onNavbarRightPress,
}) => {
  const Right = () => {
    if (isNavbarRightVisible) {
      return (
        <Icon
          hitSlop={30}
          name="ellipsis"
          color="white"
          size={32}
          onPress={onNavbarRightPress}
        />
      );
    }
    return null;
  };

  return (
    <Navbar
      iconColor="white"
      title={title}
      titleStyle={styles.title}
      rightComponent={<Right />}
    />
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
  },
});

export default HeaderCardNavbar;
