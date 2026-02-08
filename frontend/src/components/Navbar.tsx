import { FC, useRef } from 'react';
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
    IconButton,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    VStack,
    HStack,
} from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';

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
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = useRef<HTMLButtonElement>(null);

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

    const handleMobileLinkClick = () => {
        onClose();
    };

    const handleMobileLoginClick = () => {
        onClose();
        onLoginClick();
    };

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
                    px={{ base: 4, md: 8 }}
                    mx={{ base: 2, md: 4 }}
                >
                    {/* Logo */}
                    <Flex alignItems="center" gap={3}>
                        <Image src="/images/Logo.png" h={{ base: "32px", md: "40px" }} fallbackSrc="https://via.placeholder.com/40/20c997/ffffff?text=B" />
                        <Text
                            fontFamily="heading"
                            fontWeight="bold"
                            fontSize={{ base: "md", md: "lg" }}
                            color="teal.800"
                            display="block" // Always show text, maybe smaller on mobile
                            whiteSpace="nowrap"
                        >
                            BHCare Brgy. 174
                        </Text>
                    </Flex>

                    {/* Desktop Nav */}
                    <Stack direction="row" spacing={8} display={{ base: 'none', lg: 'flex' }} alignItems="center">
                        <Link href="#home" fontSize="sm" fontWeight={500} color={linkColor} _hover={{ textDecoration: 'none', color: linkHoverColor }}>{t.navHome}</Link>
                        <Link href="#services" fontSize="sm" fontWeight={500} color={linkColor} _hover={{ textDecoration: 'none', color: linkHoverColor }}>{t.navServices}</Link>
                        <Link href="#about" fontSize="sm" fontWeight={500} color={linkColor} _hover={{ textDecoration: 'none', color: linkHoverColor }}>{t.navAbout}</Link>
                        <Link href="#contact" fontSize="sm" fontWeight={500} color={linkColor} _hover={{ textDecoration: 'none', color: linkHoverColor }}>{t.navContact}</Link>
                    </Stack>

                    {/* Desktop Actions */}
                    <Flex alignItems="center" gap={4} display={{ base: 'none', lg: 'flex' }}>
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

                    {/* Mobile Menu Button */}
                    <IconButton
                        ref={btnRef}
                        display={{ base: 'flex', lg: 'none' }}
                        aria-label="Open Menu"
                        icon={<FiMenu />}
                        onClick={onOpen}
                        variant="ghost"
                        colorScheme="teal"
                    />
                </Flex>
            </Container>

            {/* Mobile Drawer */}
            <Drawer
                isOpen={isOpen}
                placement="right"
                onClose={onClose}
                finalFocusRef={btnRef}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Menu</DrawerHeader>

                    <DrawerBody>
                        <VStack spacing={6} align="stretch" mt={4}>
                            <Link href="#home" fontSize="lg" fontWeight="bold" onClick={handleMobileLinkClick}>{t.navHome}</Link>
                            <Link href="#services" fontSize="lg" fontWeight="bold" onClick={handleMobileLinkClick}>{t.navServices}</Link>
                            <Link href="#about" fontSize="lg" fontWeight="bold" onClick={handleMobileLinkClick}>{t.navAbout}</Link>
                            <Link href="#contact" fontSize="lg" fontWeight="bold" onClick={handleMobileLinkClick}>{t.navContact}</Link>

                            <Box h="1px" bg="gray.200" my={2} />

                            <HStack justify="space-between">
                                <Text fontWeight="medium">Language</Text>
                                <Button
                                    onClick={toggleLanguage}
                                    size="sm"
                                    variant="outline"
                                    rounded="full"
                                    colorScheme="teal"
                                    leftIcon={<span>{language === 'en' ? '🇺🇸' : '🇵🇭'}</span>}
                                >
                                    {language === 'en' ? 'English' : 'Tagalog'}
                                </Button>
                            </HStack>

                            {user ? (
                                <>
                                    <HStack spacing={3} py={2}>
                                        <Avatar size="sm" name={`${user.first_name} ${user.last_name}`} src={user.avatar_url} />
                                        <Text fontWeight="bold">{user.first_name}</Text>
                                    </HStack>
                                    <Button onClick={() => { onClose(); onProfileClick(); }} w="full" variant="outline">Profile</Button>
                                    <Button onClick={() => { onClose(); onAppointmentClick(); }} w="full" variant="outline">Appointments</Button>
                                    <Button onClick={() => { onClose(); onLogoutClick(); }} w="full" colorScheme="red" variant="ghost">Logout</Button>
                                </>
                            ) : (
                                <Button
                                    onClick={handleMobileLoginClick}
                                    w="full"
                                    colorScheme="orange"
                                    size="lg"
                                >
                                    {t.navLogin}
                                </Button>
                            )}
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};

export default Navbar;
