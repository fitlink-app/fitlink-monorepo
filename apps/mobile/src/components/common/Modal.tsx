import React from 'react';
import styled from 'styled-components/native';
import {Card} from './Card';
import {Button, ButtonProps} from './Button';
import {Label} from './Label';

const Wrapper = styled.View({
  width: '100%',
});

const ContentContainer = styled(Card)({
  margin: 20,
  padding: 20,
  alignItems: 'center',
});

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
  title: string;
  description: string;
  buttons?: Partial<ButtonProps>[];
}

export const Modal: React.FC<ModalProps> = ({
  children,
  title,
  description,
  buttons,
}) => {
  const renderButtons = () =>
    buttons?.length ? (
      <ButtonsContainer>
        {buttons?.map((buttonProps, index) => (
          <>
            <Button key={index} {...buttonProps} />
            {index !== buttons.length - 1 && (
              <ButtonSpacer key={`spacer_${index}`} />
            )}
          </>
        ))}
      </ButtonsContainer>
    ) : null;

  return (
    <Wrapper>
      <ContentContainer>
        <Title>{title}</Title>

        <Description>{description}</Description>

        {!!children && (
          <>
            <ChildrenContainer>{children}</ChildrenContainer>
          </>
        )}
        {renderButtons()}
      </ContentContainer>
    </Wrapper>
  );
};
