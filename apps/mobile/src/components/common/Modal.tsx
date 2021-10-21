import React, {Fragment} from 'react';
import styled from 'styled-components/native';
import {Card} from './Card';
import {Button, ButtonProps} from './Button';
import {Label} from './Label';
import {StyleProp, ViewStyle} from 'react-native';

const Wrapper = styled.View({
  width: '100%',
});

const StyledCard = styled(Card)({
  margin: 20,
  padding: 20,
  alignItems: 'center',
});

const ContentContainer = styled.View({});

const ChildrenContainer = styled.View({paddingTop: 10});

const Title = styled(Label).attrs({
  type: 'title',
  bold: true,
})({
  textAlign: 'center',
  marginBottom: 10,
});

const Description = styled(Label).attrs({
  type: 'subheading',
})({
  textAlign: 'center',
});

const ButtonsContainer = styled.View({paddingTop: 20});

const ButtonSpacer = styled.View({height: 5});

interface ModalProps {
  title?: string;
  description?: string;
  buttons?: Partial<ButtonProps>[];
  containerStyle?: StyleProp<ViewStyle>;
}

export const Modal: React.FC<ModalProps> = ({
  children,
  title,
  description,
  buttons,
  containerStyle,
}) => {
  const renderButtons = () =>
    buttons?.length ? (
      <ButtonsContainer>
        {buttons?.map((buttonProps, index) => (
          <Fragment key={index}>
            <Button {...buttonProps} />
            {index !== buttons.length - 1 && (
              <ButtonSpacer key={`spacer_${index}`} />
            )}
          </Fragment>
        ))}
      </ButtonsContainer>
    ) : null;

  return (
    <Wrapper>
      <StyledCard>
        <ContentContainer style={containerStyle}>
          {!!title && <Title>{title}</Title>}

          {!!description && <Description>{description}</Description>}

          {!!children && (
            <>
              <ChildrenContainer>{children}</ChildrenContainer>
            </>
          )}
          {renderButtons()}
        </ContentContainer>
      </StyledCard>
    </Wrapper>
  );
};
