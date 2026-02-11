
import {
    Box,
    Container,
    Heading,
    Text,
    SimpleGrid,
    Image,
    Badge,
    Flex,

} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const images = [
    {
        src: '/images/peoplemeeting.jpg',
        title: 'Community Engagement',
        tag: 'Events',
        colSpan: 2,
        height: '400px'
    },
    {
        src: '/images/ccmc.jpg',
        title: 'CCMC Partnership',
        tag: 'Medical',
        colSpan: 1,
        height: '400px'
    },
    {
        src: '/images/llanocenter.jpg',
        title: 'Llano Extension',
        tag: 'Facilities',
        colSpan: 1,
        height: '300px'
    },
    {
        src: '/images/ccnmc.jpg',
        title: 'Modern Equipment',
        tag: 'Technology',
        colSpan: 2,
        height: '300px'
    },
];

const MotionBox = motion(Box);

const CommunityGallery = () => {
    return (
        <Box py={20} position="relative">
            <Container maxW="7xl">
                {/* Header */}
                <Flex direction="column" alignItems="center" mb={16} textAlign="center">
                    <Badge colorScheme="purple" px={3} py={1} rounded="full" mb={4}>
                        GALLERY
                    </Badge>
                    <Heading
                        as="h2"
                        fontSize={{ base: "3xl", md: "5xl" }}
                        color="teal.900"
                        fontWeight="800"
                        letterSpacing="tight"
                        mb={4}
                    >
                        Life in Barangay 174
                    </Heading>
                    <Text fontSize="lg" color="gray.600" maxW="2xl">
                        A glimpse into our daily operations, community outreach, and the modern facilities serving our residents.
                    </Text>
                </Flex>

                {/* Masonry-style Grid */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    {images.map((img, index) => (
                        <MotionBox
                            key={index}
                            gridColumn={{ md: `span ${img.colSpan}` }}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            whileHover={{ y: -10 }}
                            position="relative"
                            borderRadius="2xl"
                            overflow="hidden"
                            height={{ base: "300px", md: img.height }}
                            boxShadow="2xl"
                            role="group"
                        >
                            {/* Image */}
                            <Image
                                src={img.src}
                                alt={img.title}
                                w="100%"
                                h="100%"
                                objectFit="cover"
                                transition="transform 0.5s ease"
                                _groupHover={{ transform: 'scale(1.05)' }}
                            />

                            {/* Overlay Gradient */}
                            <Box
                                position="absolute"
                                bottom={0}
                                left={0}
                                w="100%"
                                h="100%"
                                bgGradient="linear(to-t, blackAlpha.800 0%, transparent 50%)"
                                opacity={0.8}
                                transition="opacity 0.3s"
                            />

                            {/* Content */}
                            <Box
                                position="absolute"
                                bottom={0}
                                left={0}
                                p={6}
                                w="100%"
                            >
                                <Badge
                                    bg="whiteAlpha.300"
                                    color="white"
                                    mb={2}
                                    backdropFilter="blur(5px)"
                                    borderRadius="md"
                                >
                                    {img.tag}
                                </Badge>
                                <Heading size="md" color="white" mb={1}>
                                    {img.title}
                                </Heading>
                                <Box
                                    h="2px"
                                    w="0px"
                                    bg="orange.400"
                                    _groupHover={{ w: "50px" }}
                                    transition="width 0.3s ease"
                                />
                            </Box>
                        </MotionBox>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default CommunityGallery;
