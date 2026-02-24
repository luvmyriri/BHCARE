import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  SimpleGrid,
  Heading,
  Text,
  useToast,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Icon,
  Badge,
  Divider,
  Container,
  Flex,
  Avatar,
  Card,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Stack,
  AvatarBadge,
  Spacer
} from '@chakra-ui/react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiSave,
  FiLock,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

export default function Profile({ user, onClose, onUpdated }: { user: any; onClose: () => void; onUpdated: (u: any) => void }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Address Modal State
  const { isOpen: isAddressOpen, onOpen: onAddressOpen, onClose: onAddressClose } = useDisclosure();

  // Image Zoom Modal State
  const { isOpen: isImageZoomOpen, onOpen: onImageZoomOpen, onClose: onImageZoomClose } = useDisclosure();

  // Password Visibility State
  const [showPass, setShowPass] = useState(false);

  // Password Error State
  const [currentPasswordError, setCurrentPasswordError] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    date_of_birth: '',
    gender: '',
    contact_number: '+63',
    philhealth_id: '',
    email: '',

    // Low-Level Address Fields
    province: '',
    city: '',
    barangay: '',
    house_number: '',
    block_number: '',
    lot_number: '',
    street_name: '',
    subdivision: '',
    zip_code: '',

    // Password Fields
    current_password: '',
    password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/user/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm(prev => ({
          ...prev,
          first_name: data.first_name || '',
          middle_name: data.middle_name || '',
          last_name: data.last_name || '',
          suffix: data.suffix || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          contact_number: data.contact_number || '+63',
          philhealth_id: data.philhealth_id || '',
          email: data.email || '',
          province: data.province || '',
          city: data.city || '',
          barangay: data.barangay || '',
          house_number: data.house_number || '',
          block_number: data.block_number || '',
          lot_number: data.lot_number || '',
          street_name: data.street_name || '',
          subdivision: data.subdivision || '',
          zip_code: data.zip_code || '',
        }));
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [user]);

  const updateField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;

    // Formatting Logic
    if (k === 'first_name' || k === 'middle_name' || k === 'last_name') {
      value = value.replace(/[0-9]/g, '');
    } else if (k === 'contact_number') {
      let cleaned = value.replace(/[^0-9+]/g, '');
      if (cleaned.startsWith('09')) cleaned = '+63' + cleaned.substring(1);
      if (!cleaned.startsWith('+63') && cleaned.length > 0) cleaned = '+63' + cleaned.replace(/\D/g, '');
      if (cleaned.length > 13) cleaned = cleaned.substring(0, 13);
      value = cleaned;
    } else if (k === 'philhealth_id') {
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      if (cleaned.length > 2) formatted = cleaned.substring(0, 2) + '-' + cleaned.substring(2);
      if (cleaned.length > 11) formatted = formatted.substring(0, 12) + '-' + cleaned.substring(11, 12);
      if (formatted.length > 14) formatted = formatted.substring(0, 14);
      value = formatted;
    }

    setForm((f) => ({ ...f, [k]: value }));

    // Clear current password error when typing
    if (k === 'current_password') {
      setCurrentPasswordError(false);
    }
  };

  const save = async () => {
    // Email Validation
    if (form.email && !form.email.toLowerCase().endsWith('@gmail.com')) {
      toast({ title: 'Invalid Email', description: 'Email must be a @gmail.com address.', status: 'error' });
      return;
    }

    // Password Validation
    if (form.password) {
      if (!form.current_password) {
        toast({ title: 'Current password required', description: 'Please enter your current password to change it.', status: 'error' });
        return;
      }
      if (form.password !== form.confirm_password) {
        toast({ title: 'Passwords do not match', status: 'error' });
        return;
      }
    }

    setLoading(true);
    try {
      if (!user?.id) throw new Error("No user ID");

      const payload = { ...form };
      if (!payload.password) {
        delete (payload as any).password; // Don't send empty password
        delete (payload as any).current_password;
      }
      delete (payload as any).confirm_password;

      const res = await fetch(`/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMsg = 'Update failed';
        try {
          const errData = await res.json();
          if (errData.error) errorMsg = errData.error;
        } catch (err) {
          // keep default error
        }
        throw new Error(errorMsg);
      }

      const updated = { ...user, ...form };
      delete (updated as any).password;
      delete (updated as any).current_password;
      delete (updated as any).confirm_password;

      localStorage.setItem('bh_user', JSON.stringify(updated));
      if (onUpdated) onUpdated(updated);

      setForm(prev => ({
        ...prev,
        password: '',
        current_password: '',
        confirm_password: ''
      }));

      toast({ title: 'Profile Updated', description: 'Your changes have been saved.', status: 'success', duration: 2000 });
      onClose();
    } catch (e: any) {
      if (e.message === 'Incorrect current password') {
        setCurrentPasswordError(true);
      }
      toast({ title: 'Error saving profile', description: e.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Password Strength Checkers
  const hasMinLen = form.password.length >= 8;
  const hasUpper = /[A-Z]/.test(form.password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);

  // Photo Upload Handlers
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload PNG or JPEG only', status: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:5000/user/${user.id}/upload-photo`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');

      // Update local user state
      const updated = { ...user, profile_picture: data.profile_picture };
      localStorage.setItem('bh_user', JSON.stringify(updated));
      if (onUpdated) onUpdated(updated);

      toast({ title: 'Photo Updated', status: 'success' });
    } catch (err: any) {
      toast({ title: 'Upload error', description: err.message, status: 'error' });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const SectionHeader = ({ title, icon }: { title: string, icon: any }) => (
    <HStack mb={4} pb={2} borderBottom="1px solid" borderColor="gray.100">
      <Icon as={icon} color="teal.500" />
      <Heading size="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">{title}</Heading>
    </HStack>
  );

  if (!user) return null;

  return (
    <Container maxW="container.2xl" p={0}>
      <Card borderRadius="xl" boxShadow="2xl" border="1px solid" borderColor="teal.100" overflow="hidden" bg="white">
        {/* Visual Header Strip */}
        <Box h="8px" bgGradient="linear(to-r, teal.500, green.400)" />

        {/* Main Action Header */}
        <Box bg="white" borderRadius="xl" shadow="sm" p={6} mb={6} border="1px" borderColor="gray.100">
          <Flex align="center">
            <Avatar
              size="xl"
              name={`${user.first_name} ${user.last_name}`}
              src={user.profile_picture || "https://bit.ly/broken-link"}
              bg="teal.500"
              color="white"
              cursor="pointer"
              onClick={onImageZoomOpen}
              _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }}
              title="Click to zoom"
            >
              <AvatarBadge boxSize="1.25em" bg="green.500" />
            </Avatar>
            <Box ml={4}>
              <Heading size="md" color="teal.800">{user.first_name} {user.last_name} <Badge colorScheme="green" ml={2}>VERIFIED</Badge></Heading>
              <Text fontSize="sm" color="gray.500">Member ID: {user?.id} • <Button variant="link" colorScheme="teal" size="sm" onClick={handlePhotoClick}>Edit Photo</Button></Text>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
              />
            </Box>
            <Spacer />
            <HStack>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button colorScheme="teal" onClick={save} isLoading={loading} leftIcon={<FiSave />}>Save Changes</Button>
            </HStack>
          </Flex>
        </Box>
        <CardBody p={0}>
          <Stack direction={{ base: 'column', lg: 'row' }} divider={<Divider orientation="vertical" borderColor="gray.200" h={{ lg: "600px" }} />} spacing={0}>

            {/* COLUMN 1: IDENTITY */}
            <Box flex={1} p={8}>
              <SectionHeader title="Personal Identity" icon={FiUser} />
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={4} spacing={2}>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">FIRST NAME</FormLabel>
                    <Input value={form.first_name} onChange={updateField('first_name')} bg="gray.100" isReadOnly />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">MIDDLE</FormLabel>
                    <Input value={form.middle_name} onChange={updateField('middle_name')} bg="gray.100" isReadOnly />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">LAST NAME</FormLabel>
                    <Input value={form.last_name} onChange={updateField('last_name')} bg="gray.100" isReadOnly />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">SUFFIX</FormLabel>
                    <Select value={form.suffix} onChange={updateField('suffix')} bg="white">
                      <option value="">None</option>
                      <option value="Jr.">Jr.</option>
                      <option value="Sr.">Sr.</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                      <option value="V">V</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                <HStack>
                  <FormControl w="50%">
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">GENDER</FormLabel>
                    <Select value={form.gender} onChange={updateField('gender')} bg="gray.100" isDisabled>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Select>
                  </FormControl>
                  <FormControl w="50%">
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">BIRTH DATE</FormLabel>
                    <Input type="date" value={form.date_of_birth} onChange={updateField('date_of_birth')} bg="gray.100" isReadOnly />
                  </FormControl>
                </HStack>
              </VStack>

              {/* SECURITY SECTION (Moved here for balance) */}
              <Box mt={8}>
                <SectionHeader title="Security Settings" icon={FiLock} />
                <VStack spacing={4} align="stretch" bg="gray.50" p={4} borderRadius="md" border="1px dashed" borderColor="gray.300">
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">CURRENT PASSWORD</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPass ? "text" : "password"}
                        value={form.current_password}
                        onChange={updateField('current_password')}
                        autoComplete="new-password"
                        bg="white"
                        borderColor={currentPasswordError ? "red.400" : "inherit"}
                        _hover={{ borderColor: currentPasswordError ? "red.500" : "gray.300" }}
                        placeholder="Required if changing password"
                      />
                      <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={() => setShowPass(!showPass)} variant="ghost">
                          {showPass ? <FiEyeOff /> : <FiEye />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">NEW PASSWORD</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPass ? "text" : "password"}
                        value={form.password}
                        onChange={updateField('password')}
                        autoComplete="new-password"
                        bg="white"
                        placeholder="Leave blank to keep current"
                      />
                      <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={() => setShowPass(!showPass)} variant="ghost">
                          {showPass ? <FiEyeOff /> : <FiEye />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">CONFIRM PASSWORD</FormLabel>
                    <Input
                      type="password"
                      placeholder="Re-type new password"
                      value={form.confirm_password}
                      onChange={updateField('confirm_password')}
                      autoComplete="new-password"
                      bg="white"
                      isDisabled={!form.password}
                      borderColor={form.confirm_password && form.password !== form.confirm_password ? "red.300" : "inherit"}
                    />
                  </FormControl>

                  {form.password && (
                    <Box>
                      <HStack spacing={4} mt={2}>
                        <Badge colorScheme={hasMinLen ? "green" : "gray"} variant="outline">{hasMinLen ? "✓" : "○"} 8+ Chars</Badge>
                        <Badge colorScheme={hasUpper ? "green" : "gray"} variant="outline">{hasUpper ? "✓" : "○"} Upper (A-Z)</Badge>
                        <Badge colorScheme={hasSymbol ? "green" : "gray"} variant="outline">{hasSymbol ? "✓" : "○"} Symbol</Badge>
                      </HStack>
                    </Box>
                  )}
                </VStack>
              </Box>
            </Box>

            {/* COLUMN 2: CONTACT */}
            <Box flex={1} p={8} bg="white">
              <SectionHeader title="Contact & Benefits" icon={FiCreditCard} />
              <VStack spacing={5} align="stretch">
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">MOBILE NUMBER</FormLabel>
                  <InputGroup>
                    <InputLeftElement><Icon as={FiPhone} color="gray.400" /></InputLeftElement>
                    <Input value={form.contact_number} onChange={updateField('contact_number')} bg="gray.50" />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">EMAIL ADDRESS</FormLabel>
                  <InputGroup>
                    <InputLeftElement><Icon as={FiMail} color="gray.400" /></InputLeftElement>
                    <Input value={form.email} onChange={updateField('email')} bg="gray.50" />
                  </InputGroup>
                </FormControl>
                <Divider />
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">PHILHEALTH ID (OPTIONAL) </FormLabel>
                  <InputGroup>
                    <InputLeftElement><Icon as={FiCreditCard} color="gray.400" /></InputLeftElement>
                    <Input value={form.philhealth_id} onChange={updateField('philhealth_id')} bg="gray.50" />
                  </InputGroup>
                </FormControl>
              </VStack>
            </Box>

            {/* COLUMN 3: ADDRESS (Summary + Action) */}
            <Box flex={1} p={8}>
              <SectionHeader title="Residential Address" icon={FiMapPin} />

              <Box bg="teal.50" p={5} borderRadius="lg" border="1px solid" borderColor="teal.100" mb={4}>
                <VStack align="start" spacing={1}>
                  <Badge colorScheme="teal" mb={1}>Current Address</Badge>

                  {/* House & Street */}
                  {(form.house_number || form.street_name) && (
                    <Text fontWeight="bold" fontSize="lg" color="teal.800">
                      {form.house_number ? `#${form.house_number} ` : ''}
                      {form.street_name}
                    </Text>
                  )}

                  {/* Block, Lot, Subdivision */}
                  {(form.block_number || form.lot_number || form.subdivision) && (
                    <Text color="teal.800" fontWeight="500">
                      {form.block_number ? `${form.block_number}, ` : ''}
                      {form.lot_number ? `${form.lot_number} ` : ''}
                      {form.subdivision ? `${form.block_number || form.lot_number ? ', ' : ''}${form.subdivision}` : ''}
                    </Text>
                  )}

                  {/* Barangay, City */}
                  <Text color="teal.700">
                    {form.barangay}{form.barangay && form.city ? ', ' : ''}{form.city}
                  </Text>

                  {/* Province, Zip */}
                  <Text color="teal.600" fontSize="sm">
                    {form.province} {form.zip_code ? ` ${form.zip_code}` : ''}
                  </Text>

                  {/* Fallback */}
                  {(!form.street_name && !form.barangay && !form.city && !form.province && !form.house_number && !form.block_number && !form.lot_number) && (
                    <Text color="gray.400" fontSize="sm" fontStyle="italic">No address set</Text>
                  )}
                </VStack>
              </Box>

              <Button
                onClick={onAddressOpen}
                leftIcon={<FiMapPin />}
                width="full"
                size="lg"
                variant="outline"
                colorScheme="teal"
                height="60px"
                borderStyle="dashed"
                _hover={{ bg: "teal.50" }}
              >
                Edit Complete Address
              </Button>

              <Text fontSize="xs" color="gray.400" mt={4} textAlign="center">
                Click above to manage House No, Block, Lot, Street, and more details.
              </Text>
            </Box>

          </Stack>
        </CardBody>
      </Card>

      {/* IMAGE ZOOM MODAL */}
      <Modal isOpen={isImageZoomOpen} onClose={onImageZoomClose} size="full" isCentered>
        <ModalOverlay bg="blackAlpha.900" backdropFilter="blur(10px)" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" size="lg" zIndex={2} />
          <ModalBody display="flex" alignItems="center" justifyContent="center" p={8}>
            <Box
              maxW="90vw"
              maxH="90vh"
              position="relative"
              onClick={onImageZoomClose}
              cursor="zoom-out"
            >
              <img
                src={user.profile_picture || "https://bit.ly/broken-link"}
                alt={`${user.first_name} ${user.last_name}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                }}
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* ADDRESS MODAL */}
      {/* Safety check after hooks */}
      {/* The user check should be at the top level of the component function, not within JSX. */}
      {/* Assuming this Modal is part of the main component's render, the user check would be outside this JSX block. */}
      {/* If the instruction implies a different structure, please provide more context. */}
      <Modal isOpen={isAddressOpen} onClose={onAddressClose} size="xl">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent>
          <ModalHeader bgGradient="linear(to-r, teal.500, green.500)" color="white">
            <HStack>
              <Icon as={FiMapPin} />
              <Text>Update Complete Address</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={6}>
            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">PROVINCE</FormLabel>
                <Input value={form.province} onChange={updateField('province')} placeholder="e.g. Metro Manila" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">CITY / MUNICIPALITY</FormLabel>
                <Input value={form.city} onChange={updateField('city')} placeholder="e.g. Caloocan City" />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">BARANGAY</FormLabel>
                <Input value={form.barangay} onChange={updateField('barangay')} placeholder="e.g. Barangay 171" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">HOUSE NO.</FormLabel>
                <Input value={form.house_number} onChange={updateField('house_number')} placeholder="e.g. 123" />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">BLOCK</FormLabel>
                <Input value={form.block_number} onChange={updateField('block_number')} placeholder="e.g. Blk 5" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">LOT</FormLabel>
                <Input value={form.lot_number} onChange={updateField('lot_number')} placeholder="e.g. Lot 2" />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">STREET</FormLabel>
                <Input value={form.street_name} onChange={updateField('street_name')} placeholder="e.g. Main St." />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">VILLAGE / SUBDIVISION</FormLabel>
                <Input value={form.subdivision} onChange={updateField('subdivision')} placeholder="e.g. Happy Homes" />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">ZIP CODE</FormLabel>
                <Input value={form.zip_code} onChange={updateField('zip_code')} placeholder="e.g. 1400" />
              </FormControl>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter bg="gray.50">
            <Button variant="ghost" mr={3} onClick={onAddressClose}>Cancel</Button>
            <Button colorScheme="teal" onClick={onAddressClose}>Done</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Container>
  );
}
