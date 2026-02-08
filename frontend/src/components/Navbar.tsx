import { FC } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
    Box,
    Flex,
    Text,
    Button,
    Stack,
    Link,
    Container,
    Image,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Avatar,
} from '@chakra-ui/react';

interface NavbarProps {
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onProfileClick: () => void;
    onAppointmentClick: () => void;
    user: any;
}

const Navbar: FC<NavbarProps> = ({
    onLoginClick,
    onLogoutClick,
    onProfileClick,
    onAppointmentClick,
    user,
}) => {
    const { language, setLanguage, t } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'tl' : 'en');
    };

    // Mint and Orange Theme
    const linkColor = 'teal.700';
    const linkHoverColor = 'orange.500';

    // Glassmorphism Values
    const glassBg = 'rgba(255, 255, 255, 0.25)';
    const glassBorder = '1px solid rgba(255, 255, 255, 0.4)';
    const glassShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.07)';

    return (
        <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            zIndex={10}
            pt={4}
        >
            <Container maxW="7xl">
                <Flex
                    h={20}
                    alignItems="center"
                    justifyContent="space-between"
                    bg={glassBg}
                    backdropFilter="blur(16px)"
                    borderRadius="2xl"
                    border={glassBorder}
                    boxShadow={glassShadow}
                    px={8}
                    mx={4}
                >
                    {/* Logo */}
                    <Flex alignItems="center" gap={3}>
                        <Image src="/images/Logo.png" h="40px" fallbackSrc="https://via.placeholder.com/40/20c997/ffffff?text=B" />
                        <Text
                            fontFamily="heading"
                            fontWeight="bold"
                            fontSize="lg"
                            color="teal.800"
                            display={{ base: 'none', md: 'block' }}
                            whiteSpace="nowrap"
                        >
                            BHCare Brgy. 174
                        </Text>
                    </Flex>

                    {/* Desktop Nav */}
                    <Stack direction="row" spacing={8} display={{ base: 'none', md: 'flex' }} alignItems="center">
                        <Link href="#home" fontSize="sm" fontWeight={500} color={linkColor} _hover={{ textDecoration: 'none', color: linkHoverColor }}>{t.navHome}</Link>
                        <Link href="#services" fontSize="sm" fontWeight={500} color={linkColor} _hover={{ textDecoration: 'none', color: linkHoverColor }}>{t.navServices}</Link>
                        <Link href="#about" fontSize="sm" fontWeight={500} color={linkColor} _hover={{ textDecoration: 'none', color: linkHoverColor }}>{t.navAbout}</Link>
                        <Link href="#contact" fontSize="sm" fontWeight={500} color={linkColor} _hover={{ textDecoration: 'none', color: linkHoverColor }}>{t.navContact}</Link>
                    </Stack>

                    {/* Actions */}
                    <Flex alignItems="center" gap={4}>
                        {/* Language Toggle */}
                        <Button
                            onClick={toggleLanguage}
                            size="sm"
                            variant="ghost"
                            rounded="full"
                            color={linkColor}
                            _hover={{ bg: 'teal.50' }}
                            leftIcon={<span>{language === 'en' ? '🇺🇸' : '🇵🇭'}</span>}
                        >
                            {language === 'en' ? 'EN' : 'TL'}
                        </Button>

                        {user ? (
                            <Menu>
                                <MenuButton
                                    as={Button}
                                    variant="ghost"
                                    rounded="full"
                                    cursor="pointer"
                                    minW={0}
                                    padding={0}
                                >
                                    <Avatar size="sm" name={`${user.first_name} ${user.last_name}`} src={user.avatar_url} />
                                </MenuButton>
                                <MenuList>
                                    <MenuItem onClick={onProfileClick}>
                                        Profile
                                    </MenuItem>
                                    <MenuItem onClick={onAppointmentClick}>
                                        Appointments
                                    </MenuItem>
                                    <MenuItem onClick={onLogoutClick} color="red.500">
                                        Logout
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        ) : (
                            <Button
                                onClick={onLoginClick}
                                fontSize="sm"
                                fontWeight={600}
                                color="white"
                                bg="orange.400"
                                rounded="full"
                                px={8}
                                _hover={{
                                    bg: 'orange.500',
                                    boxShadow: 'lg',
                                }}
                            >
                                {t.navLogin}
                            </Button>
                        )}
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
};

export default Navbar;
